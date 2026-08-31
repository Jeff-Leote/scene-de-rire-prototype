# Services et Types

Ce dossier contient tous les services et types centralisés pour l'application.

## Structure

### `types.ts`

Fichier centralisé contenant toutes les interfaces TypeScript utilisées dans l'application :

#### Interfaces principales :

- **User** : Interface pour les utilisateurs
- **Spectacle** : Interface pour les spectacles
- **Artist** : Interface pour les artistes
- **Avis** : Interface pour les avis

#### Interfaces de formulaires :

- **SpectacleFormData** : Données de formulaire pour les spectacles
- **ArtistFormData** : Données de formulaire pour les artistes

#### Interfaces de contexte :

- **AuthContextType** : Type pour le contexte d'authentification

#### Interfaces spécialisées :

- **FeaturedArtist** : Interface pour l'artiste à l'affiche (Hero)
- **ApiResponse<T>** : Interface générique pour les réponses API

### `spectacles.ts`

Service pour la gestion des spectacles :

- `getSpectacles()` : Récupère tous les spectacles
- `fetchSpectacles()` : Récupère tous les spectacles (version alternative)
- `fetchSpectacleById(id)` : Récupère un spectacle par ID

## Utilisation

Pour utiliser les types dans vos composants :

```typescript
import { Spectacle, Artist } from '../services/types';
```

Pour utiliser les services :

```typescript
import { getSpectacles } from '../services/spectacles';
```

## Avantages de cette organisation

1. **Centralisation** : Toutes les interfaces sont définies dans un seul endroit
2. **Réutilisabilité** : Les types peuvent être importés partout dans l'application
3. **Maintenabilité** : Les modifications de types se font à un seul endroit
4. **Cohérence** : Garantit que les mêmes structures de données sont utilisées partout
5. **Documentation** : Les interfaces servent de documentation pour les structures de données
