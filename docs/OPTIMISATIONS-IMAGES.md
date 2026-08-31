# Guide d’optimisation des images

Ce document décrit comment aller plus loin sur les images : formats (WebP/AVIF), tailles adaptées, CDN et preload pour les images critiques (ex. hero).

---

## 1. Formats modernes : WebP et AVIF

### Pourquoi

- **WebP** : bonne compression, support large. Réduit souvent le poids de 25–35 % vs JPEG.
- **AVIF** : encore meilleure compression, support croissant. Réduit souvent le poids de 50 % vs JPEG.

### Mise en place

**Option A – Fichiers statiques (déjà en place partiellement)**  
Le projet utilise déjà `.replace(/\.(jpe?g)$/i, '.webp')` dans plusieurs composants (SpectacleDetail, Venue, Sponsorise, etc.) pour demander une version WebP si elle existe. À faire :

- À l’upload (admin), générer une version WebP (et optionnellement AVIF) en plus du JPEG/PNG (ex. avec Sharp côté backend).
- Stocker les fichiers : `image.jpg`, `image.webp`, `image.avif` (ou un sous-dossier).

**Option B – Balise `<picture>` (recommandé)**  
Servir plusieurs formats et laisser le navigateur choisir :

```html
<picture>
  <source srcset="/assets/img/spectacles/hero.avif" type="image/avif" />
  <source srcset="/assets/img/spectacles/hero.webp" type="image/webp" />
  <img src="/assets/img/spectacles/hero.jpg" alt="Hero" loading="eager" decoding="async" />
</picture>
```

Dans ton helper (ex. `buildImgSrc` ou un composant `OptimizedImage`), tu peux exposer une version qui renvoie plusieurs URLs (jpg, webp, avif) pour générer le `<picture>`.

**Génération des variantes**

- Côté backend (Node) : **Sharp** (`sharp`) pour convertir en WebP/AVIF à l’upload ou via un job.
- Exemple Sharp WebP : `sharp(input).webp({ quality: 80 }).toFile('image.webp')`.
- Exemple Sharp AVIF : `sharp(input).avif({ quality: 60 }).toFile('image.avif')`.

---

## 2. Tailles adaptées (responsive)

Éviter de charger une image 2000px de large sur mobile.

### Méthode 1 – `srcset` + `sizes`

Pour une même image en plusieurs largeurs :

```html
<img
  srcset="
    /assets/img/spectacles/show-400.webp   400w,
    /assets/img/spectacles/show-800.webp   800w,
    /assets/img/spectacles/show-1200.webp 1200w
  "
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
  src="/assets/img/spectacles/show-800.webp"
  alt="Spectacle"
  loading="lazy"
/>
```

Générer les variantes (400, 800, 1200) à l’upload avec Sharp (ex. `resize(400)`, `resize(800)`, `resize(1200)`).

### Méthode 2 – API d’images (CDN / service)

Si tu utilises un CDN avec redimensionnement (Cloudinary, imgix, etc.), l’URL contient la largeur :  
`https://cdn.example.com/img/show.jpg?w=800` → le CDN renvoie une image 800px de large.

---

## 3. CDN

### Intérêt

- Servir les images depuis un domaine dédié (ex. `cdn.espacecomedie.fr`).
- Cache proche de l’utilisateur, moins de charge sur ton serveur.

### Mise en place

1. Choisir un fournisseur : Cloudflare (R2 + cache), Cloudinary, Bunny CDN, ou stockage S3/Supabase + CloudFront.
2. Configurer le domaine (CNAME) et, si besoin, le certificat SSL.
3. Dans le projet, définir une base URL pour les assets images (ex. variable d’environnement `VITE_CDN_IMAGES_URL`).
4. Adapter `buildImgSrc` (ou équivalent) pour préfixer les chemins par cette base en production :  
   `return ${import.meta.env.VITE_CDN_IMAGES_URL || ''}/assets/img/${category}/${encodedFilename}`.

Tu utilises déjà Supabase pour certains uploads ; les URLs Supabase peuvent être mises en cache via un CDN (Cloudflare devant Supabase, ou option similaire).

---

## 4. Preload pour les 1–2 images les plus importantes (ex. hero)

Pour que l’image hero commence à se charger le plus tôt possible (améliore le LCP).

### Où ajouter le preload

Dans `frontend/index.html`, dans le `<head>`, ajouter par exemple :

```html
<!-- Preload de l’image hero (premier spectacle à l’affiche) -->
<link rel="preload" as="image" href="/assets/img/spectacles/hero-principal.webp" />
```

Problème : en SPA, le “premier” spectacle est connu seulement après les données (API ou `__INITIAL_DATA__`). Deux approches :

**A – Image hero fixe**  
Si tu as une image hero unique (ex. logo ou bannière générique), utilise-la en dur dans le preload comme ci-dessus.

**B – Preload dynamique côté serveur (Option B)**  
Lors de l’injection des données initiales pour `/`, le backend connaît déjà `spectaclesUpcoming` (ou le premier spectacle). Tu peux :

- Dans `backend/src/initialData.js`, exposer aussi l’URL de la première image hero (ex. premier spectacle).
- Dans le handler qui injecte le HTML (server.js), en plus de `window.__INITIAL_DATA__`, injecter une balise :

  ```html
  <link rel="preload" as="image" href="https://ton-origine/assets/img/spectacles/XXX.webp" />
  ```

  en remplaçant `XXX` par le chemin de l’image du premier spectacle (même logique que `buildImgSrc` côté backend pour construire l’URL).

Exemple côté backend (après avoir récupéré `spectaclesUpcoming`) :

```js
const firstImg = spectaclesUpcoming?.[0]?.img;
const heroHref = firstImg
  ? `${baseUrl}/assets/img/spectacles/${encodeURIComponent(firstImg.replace(/\.(jpe?g)$/i, '.webp'))}`
  : '';
// Dans le HTML, remplacer <!--PRELOAD_HERO--> par :
// <link rel="preload" as="image" href="..." /> si heroHref existe
```

Et dans `index.html` ajouter un placeholder `<!--PRELOAD_HERO-->` que le serveur remplace.

---

## Récapitulatif

| Action           | Où                                                                         | Effort         |
| ---------------- | -------------------------------------------------------------------------- | -------------- |
| WebP/AVIF        | Génération à l’upload (Sharp) + `<picture>` ou `.webp` dans les composants | Moyen          |
| Tailles adaptées | Génération de variantes (Sharp) + `srcset`/`sizes` ou API CDN              | Moyen          |
| CDN              | Config DNS + base URL dans le projet                                       | Faible à moyen |
| Preload hero     | Backend : injecter `<link rel="preload">` dans le HTML pour `/`            | Faible         |

En commençant par le preload hero (avec les données initiales déjà injectées), puis WebP/AVIF et CDN, tu optimises fortement le ressenti et les métriques (LCP, poids des images).
