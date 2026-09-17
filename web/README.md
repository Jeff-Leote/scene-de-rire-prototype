# Espace Comédie — site public (Next.js)

Nouvelle version du site public d'espacecomedie.fr, en remplacement progressif de `frontend/` + `backend/` (React/Vite + Express/MySQL).

## Stack

- Next.js (App Router) + React + TypeScript
- Prisma + PostgreSQL (hébergé sur Supabase)
- Tailwind CSS
- Vitest pour les tests

## Ce qui est volontairement absent de ce projet

- Pas de backend séparé : Next.js gère à la fois le rendu et l'accès à la base de données
- Pas de Redis, pas d'authentification (JWT) — ce site est en lecture seule pour les visiteurs
- Pas de dashboard admin — développé séparément, dans son propre projet, plus tard

## Développement local

```bash
cp .env.example .env.local   # renseigner DATABASE_URL (Supabase)
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run dev
```

## Commandes utiles

```bash
npm run lint              # ESLint
npm run format:check      # Prettier (vérification)
npm run test              # Tests unitaires (Vitest)
npm run test:cov          # Tests avec couverture
npm run prisma:studio     # Explorer la base de données → localhost:5555
```

## CI/CD

Même process que cookthatone-backend : 4 workflows GitHub Actions déclenchés sur push/PR
touchant `web/**` (`web-ci-quality`, `web-ci-test`, `web-ci-build`, `web-cd`). Le déploiement
(`web-cd`) ne se déclenche que sur push direct vers `main`, jamais sur une pull request.

Secret GitHub requis : `RENDER_WEB_DEPLOY_HOOK_URL` (Dashboard Render → Settings → Deploy Hook).
