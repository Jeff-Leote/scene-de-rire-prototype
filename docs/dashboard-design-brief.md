# Dossier de conception — Dashboard admin Espace Comédie

## 1. Contexte

Dashboard d'administration pour le site **L'Espace Comédie Lille** (espacecomedie.fr), séparé du site public (Next.js). Permet à l'exploitant (pas de client final, usage interne à 1-2 personnes) de gérer le contenu du site sans toucher au code : spectacles, artistes, photos, page "Le lieu", et un éditeur visuel des sections de l'accueil façon **Page Builder** (inspiration Magento Page Builder pour la structure, pas pour les couleurs).

Pas de comptes visiteurs, pas d'espace client — uniquement un accès admin.

## 2. Identité visuelle

Le dashboard doit visuellement **prolonger le site public** (même famille de marque), pas ressembler à un outil générique.

- **Couleur d'accent** : rouge `#EF4444`, survol `#DC2626`
- **Fond** : thème sombre uniquement — noir (`#000000`) pour les sections principales, gris très foncé (`#111827` / gris-900) pour les cartes, gris (`#1F2937` / gris-800) pour les éléments secondaires
- **Texte** : blanc pour les titres, gris clair (`#D1D5DB` / gris-300) pour le texte courant, gris moyen (`#9CA3AF` / gris-400) pour les métadonnées/légendes
- **Typographie** : Inter (Google Fonts), sans-serif, poids 400/500/700
- **Coins arrondis** : `rounded-lg` (8px) sur les cartes et boutons, `rounded-full` sur les badges/avatars
- **Pas de dégradés ni d'ombres portées** — surfaces plates, cohérent avec le site public actuel

## 3. Structure de navigation

Barre latérale sombre et étroite, à icônes (façon Magento admin), fixe à gauche :

- Logo/icône en haut
- Icônes empilées verticalement, chacune avec un petit libellé sous l'icône : **Tableau de bord**, **Page builder**, **Spectacles**, **Artistes**, **Le lieu**, **Paramètres**
- L'item actif a un fond légèrement plus clair + une barre verticale rouge sur le bord gauche
- **Au clic sur une icône** : un panneau déroulant sombre (un ton plus clair que la sidebar) s'ouvre juste à droite de la sidebar, listant les sous-actions de cette section (ex. pour "Spectacles" : *Tous les spectacles*, *Ajouter un spectacle*, *Catégories*, *Photos additionnelles*). Le contenu principal derrière ce panneau reste visible mais légèrement estompé.
- Cette interaction (icône → panneau déroulant sombre avec sous-liens) est le patron de navigation principal de tout le dashboard.

## 4. Écrans à concevoir

1. Connexion
2. Tableau de bord (accueil admin)
3. Page Builder — éditeur des blocs de l'accueil
4. Page Builder — édition du bloc Hero / Carrousel (détaillé en 5.4)
5. Spectacles — liste
6. Spectacles — formulaire création/édition
7. Artistes — liste
8. Artistes — formulaire création/édition
9. Photos additionnelles — gestion par spectacle
10. Le lieu — image principale + galerie
11. Spectacles mis en avant — sélection
12. Paramètres généraux

## 5. Détail des écrans

### 5.1 Connexion

Écran centré, fond noir, carte sombre centrée (max ~400px de large) : logo en haut, champ "Nom d'utilisateur", champ "Mot de passe", bouton rouge pleine largeur "Se connecter". Pas d'inscription, pas de mot de passe oublié en libre-service (accès géré manuellement, 1-2 utilisateurs).

### 5.2 Tableau de bord

Vue d'accueil simple après connexion : quelques cartes de statistiques (nombre de spectacles à venir, nombre d'artistes, dernière modification) en haut, puis des raccourcis rapides vers "Ajouter un spectacle" et "Éditer la page d'accueil".

### 5.3 Page Builder — liste des blocs

Pour la page d'accueil (et à terme "Le lieu") : liste verticale de cartes, une par section de la page (Hero, Prochains spectacles, Artistes déjà venus, Notre salle). Chaque carte :

- Icône de poignée de glisser-déposer à gauche (réordonner)
- Icône représentant le type de bloc
- Nom du bloc + courte description de son contenu
- Icône "œil" pour masquer/afficher le bloc sur le site public
- Icône "crayon" pour éditer son contenu
- Bouton "+ Ajouter un bloc" en bas de la liste

### 5.4 Page Builder — édition du bloc Hero / Carrousel (important, à soigner particulièrement)

C'est le bloc le plus visuel du dashboard — l'éditeur doit donner un **aperçu fidèle du rendu réel sur le site public**, pas juste un formulaire. Comportement exact à reproduire (actuellement codé en dur, à rendre éditable) :

- Grand aperçu pleine largeur (ratio proche de 500-700px de haut), image de fond en `object-cover`, dégradé sombre du bas vers le haut (transparent en haut, noir en bas) pour la lisibilité du texte
- Flèches de navigation rondes semi-transparentes (fond noir 40% d'opacité) à gauche et à droite, superposées sur l'image, pour parcourir les slides
- Contenu texte plaqué en bas à gauche de l'image : un badge rouge arrondi "À venir", la date et l'heure du spectacle, un grand titre en gras (le nom du spectacle), puis deux boutons côte à côte ("Réserver maintenant" en rouge plein, "Plus d'infos" en contour rouge)
- Petits points de pagination (ronds, actif = rouge plein, inactifs = gris) sous les boutons, un point par slide
- **Chaque slide correspond à un spectacle existant** (le contenu n'est pas libre — l'admin choisit quels spectacles apparaissent dans le carrousel et dans quel ordre, plutôt que de retaper titre/date/image à la main)
- Sous l'aperçu : une liste réordonnable des slides sélectionnés (miniature + titre du spectacle + bouton retirer), et un bouton "+ Ajouter un spectacle au carrousel" qui ouvre une recherche/sélection parmi les spectacles existants

### 5.5 Spectacles — liste

Tableau avec colonnes : Titre, Date, Heure, Catégorie, Lieu, Actions (Modifier / Supprimer). Bouton "+ Ajouter un spectacle" en haut à droite. Recherche/filtre simple au-dessus du tableau.

### 5.6 Spectacles — formulaire création/édition

Carte centrée, champs dans l'ordre :
- Titre (texte)
- Description (zone de texte multiligne)
- Date (sélecteur de date) et Heure (sélecteur d'heure), côte à côte
- Lieu (liste déroulante) et Catégorie (liste déroulante), côte à côte
- Lien billetterie (URL)
- Image (zone de dépôt de fichier avec aperçu miniature)
- Boutons "Annuler" (contour) et "Enregistrer" (rouge plein) en bas à droite

### 5.7 Artistes — liste et formulaire

Même structure que Spectacles (liste tableau + formulaire carte), champs : Nom, Photo, Description courte.

### 5.8 Photos additionnelles

Écran par spectacle : grille de miniatures des photos déjà ajoutées (avec bouton supprimer au survol), zone de dépôt pour en ajouter de nouvelles.

### 5.9 Le lieu

Deux sections : "Image principale" (une image, remplaçable) et "Galerie" (grille de miniatures réordonnables, ajout/suppression), même logique que Photos additionnelles.

### 5.10 Spectacles mis en avant

Liste de tous les spectacles à venir avec une case à cocher "Mettre en avant sur l'accueil" à côté de chacun, et un champ d'ordre si plusieurs sont sélectionnés.

### 5.11 Paramètres généraux

Formulaire simple : email de contact (texte), interrupteur "Mode maintenance" (avec description de ce que ça déclenche).

## 6. Composants UI réutilisables (à définir comme composants Figma)

- **Carte sombre** : fond gris-900, coins arrondis 8px, padding confortable, pas de bordure
- **Bouton primaire** : fond rouge `#EF4444`, texte blanc, `rounded-lg`, survol `#DC2626`
- **Bouton secondaire** : contour rouge, texte rouge, fond transparent, survol fond rouge + texte blanc
- **Bouton neutre/annuler** : contour gris, texte gris clair
- **Badge** : fond rouge plein, texte blanc, `rounded-full`, texte en majuscules, petit
- **Avatar à initiales** : cercle rouge plein, initiales blanches centrées (pas de photos externes hotlinkées — voir décision produit ci-dessous)
- **Champ de formulaire** : fond légèrement plus clair que la carte, bordure fine grise, texte blanc, label gris clair au-dessus
- **Icône de poignée de glisser-déposer** : verticale, 6 points, gris clair
- **Toggle/interrupteur** : style iOS, off = gris, on = rouge

## 7. Contraintes et décisions produit à respecter

- **Thème sombre uniquement** — pas de mode clair à prévoir pour le dashboard
- **Pas de photos de profil externes hotlinkées** (retour d'expérience du site public : les photos de profil Google refusent systématiquement le hotlinking) — toujours utiliser des avatars à initiales générés, jamais une image externe non maîtrisée
- **Responsive desktop-first** : usage interne, principalement sur ordinateur, mais la mise en page doit rester utilisable sur tablette (pas d'optimisation mobile poussée nécessaire)
- **Cohérence stricte avec le site public** : toute maquette doit pouvoir être comparée visuellement au rendu réel sur espacecomedie.fr (mêmes couleurs, même police, mêmes rayons de bordure) — le dashboard n'est pas un produit à part, c'est l'outil de gestion du même produit

## 8. Référence d'inspiration structurelle

La structure de navigation (icônes latérales → panneau déroulant sombre avec sous-liens) et la philosophie de l'éditeur "Page Builder" (blocs réordonnables par glisser-déposer, chacun avec un aperçu fidèle du rendu final) s'inspirent de l'interface d'administration Magento — **uniquement pour le comportement et la structure**, pas pour les couleurs (Magento utilise du orange/marron, à ignorer complètement — la palette du dashboard reste celle d'Espace Comédie : noir, gris foncé, rouge).
