# Site Repair Cafe 74

Premier site statique pour une association locale, construit avec Astro, Tailwind CSS, Decap CMS et GitHub Pages.

## Demarrer en local

```bash
npm install
npm run dev
```

Le site sera disponible sur l'URL affichee par Astro, generalement `http://localhost:4321`.

## Tester Decap CMS en local

Decap CMS utilise le fichier `public/admin/config.yml`. Pour tester l'edition locale, lancer :

```bash
npm run start:all
```

Puis ouvrir `http://localhost:4321/admin`.

Le proxy local Decap ecrit directement dans les fichiers Markdown du depot. Les contenus de test vivent dans `src/content`.

## Collections de contenu

- `src/content/events` : agenda des ateliers
- `src/content/locations` : lieux affiches sur la carte
- `src/content/faq` : questions frequentes
- `src/content/resources` : ressources PDF
- `src/content/photos` : galerie photos
- `src/content/press` : liens presse et partenaires

## Deploiement GitHub Pages

Le workflow `.github/workflows/deploy.yml` construit Astro et publie `dist` via GitHub Pages.

Avant le deploiement reel :

1. Remplacer `site` dans `astro.config.mjs` par le domaine final.
2. Remplacer `ORGANISATION/site-repair-cafe-74` dans `public/admin/config.yml`.
3. Configurer GitHub Pages avec la source `GitHub Actions`.
4. Configurer l'OAuth GitHub pour Decap CMS, ou garder l'edition Markdown via GitHub si c'est plus simple.

## Scripts

```bash
npm run dev       # serveur Astro
npm run build     # build statique
npm run preview   # preview du build
npm run check     # verification Astro/TypeScript
npm run cms:proxy # proxy local Decap CMS
npm run start:all # proxy Decap + serveur Astro
```
