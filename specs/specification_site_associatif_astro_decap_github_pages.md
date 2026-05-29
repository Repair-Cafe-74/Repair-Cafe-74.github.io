# Cahier des charges et guide de setup — Site associatif léger

## Objectif du projet

Construire un site web moderne, extrêmement léger, sobre énergétiquement et simple à maintenir pour une association locale.

Le site doit :
- être généré statiquement
- être responsive
- avoir un design moderne
- être facilement éditable par des bénévoles non techniques
- éviter les solutions lourdes type WordPress
- avoir une maintenance minimale
- être hébergeable gratuitement

---

# Stack technique retenue

| Élément | Choix |
|---|---|
| Framework statique | Astro |
| CMS | Decap CMS |
| Hébergement | GitHub Pages |
| Authentification CMS | GitHub OAuth |
| Repository | GitHub |
| Carte | Leaflet + OpenStreetMap |
| Styling | Tailwind CSS |
| Icônes | Lucide |
| Contenu | Markdown |

---

# Architecture générale du site

Le site est entièrement statique.

Flux général :

1. Les bénévoles éditent le contenu via Decap CMS
2. Decap CMS écrit des fichiers Markdown dans le repository GitHub
3. GitHub Actions déclenche un build Astro
4. Astro génère le site statique
5. GitHub Pages publie le site

Aucune base de données.
Aucun backend applicatif.
Aucun serveur Node permanent.

---

# Fonctionnalités attendues

## 1. Présentation de l’association

Pages statiques :
- histoire
- objectifs
- activités
- équipe éventuelle
- partenaires

---

## 2. Carte des lieux

Afficher une carte interactive avec :
- les lieux de présence
- description
- horaires
- liens éventuels

Contraintes :
- utiliser Leaflet
- utiliser OpenStreetMap
- éviter Google Maps
- limiter le poids JavaScript

---

## 3. Agenda des événements

Fonctionnalités :
- liste chronologique
- affichage date/heure
- lieu
- description
- filtrage éventuel futur

Les événements sont stockés en Markdown.

---

## 4. Ressources PDF

Permettre :
- upload de PDF
- affichage des ressources
- téléchargement simple

---

## 5. FAQ

FAQ éditable depuis Decap CMS.

---

## 6. Sites et médias parlant de l’association

Liste éditable de :
- liens
- articles
- mentions presse
- partenaires

---

## 7. Contact

Contenu :
- email
- formulaire simple
- liens réseaux sociaux éventuels
- newsletter éventuelle

Le formulaire doit éviter un backend complexe.

Solutions possibles :
- Formspree
- FormSubmit
- simple lien mailto

---

# Contraintes de design

Le design doit être :
- moderne
- minimaliste
- responsive
- sobre
- accessible
- rapide à charger

Utiliser :
- Tailwind CSS
- Lucide Icons
- typographie moderne sobre

Éviter :
- animations lourdes
- carrousels inutiles
- vidéos automatiques
- dépendances JS lourdes
- frameworks frontend complexes inutiles

---

# Structure recommandée du repository

```txt
.
├── public/
│   ├── admin/
│   ├── images/
│   └── documents/
│
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   └── content/
│       ├── events/
│       ├── faq/
│       ├── press/
│       ├── resources/
│       └── locations/
│
├── .github/
│   └── workflows/
│
├── astro.config.mjs
├── package.json
└── tailwind.config.mjs
```

---

# Pages attendues

Créer les pages suivantes :

| URL | Description |
|---|---|
| / | Accueil |
| /association | Présentation |
| /agenda | Agenda des événements |
| /carte | Carte interactive |
| /ressources | PDFs et documents |
| /faq | FAQ |
| /presse | Sites parlant de nous |
| /contact | Contact |
| /admin | Interface Decap CMS |

---

# Collections Astro attendues

Configurer Astro Content Collections.

## Events

Exemple de structure Markdown :

```md
---
title: "Atelier vélo"
date: "2026-06-12"
location: "Maison des associations"
summary: "Atelier participatif"
---

Description complète.
```

---

## FAQ

```md
---
question: "Comment adhérer ?"
order: 1
---

Réponse.
```

---

## Presse

```md
---
title: "Article du journal local"
url: "https://example.com"
source: "Journal Local"
date: "2026-05-01"
---
```

---

## Lieux

```md
---
name: "Maison des associations"
lat: 48.8566
lng: 2.3522
hours: "Mardi 18h-20h"
---

Description du lieu.
```

---

# Instructions spécifiques à Codex

## Objectifs prioritaires

1. Minimiser le poids du site
2. Minimiser le JavaScript client
3. Produire du HTML statique autant que possible
4. Favoriser l’accessibilité
5. Favoriser la simplicité de maintenance
6. Favoriser la lisibilité du code

---

## Contraintes techniques importantes

### IMPORTANT

Le site doit rester essentiellement statique.

Ne PAS ajouter :
- React inutilement
- Vue inutilement
- SPA complexes
- APIs serveur
- base de données
- dépendances lourdes

---

## JavaScript

Limiter strictement le JavaScript client.

Préférer :
- HTML statique
- CSS
- progressive enhancement

---

## Images

Optimiser automatiquement :
- tailles
- compression
- WebP

---

## SEO

Prévoir :
- meta tags
- sitemap
- RSS éventuel
- Open Graph

---

## Accessibilité

Prévoir :
- contrastes suffisants
- navigation clavier
- labels ARIA si nécessaire
- responsive mobile-first

---

# Setup Astro

## Initialisation

```bash
npm create astro@latest
```

Choisir :
- template minimal
- TypeScript optionnel
- Git activé

---

## Dépendances recommandées

```bash
npm install @astrojs/tailwind
npm install @astrojs/sitemap
npm install leaflet
npm install lucide
npm install decap-cms-app
```

---

# Setup Tailwind

Configurer Tailwind proprement.

Style attendu :
- minimal
- clair
- moderne
- responsive

---

# Setup Decap CMS

Créer :

```txt
public/admin/index.html
public/admin/config.yml
```

---

## Exemple minimal de index.html

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin</title>
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3/dist/decap-cms.js"></script>
  </body>
</html>
```

---

## Exemple minimal de config.yml

```yaml
backend:
  name: github
  repo: ORGANISATION/REPO
  branch: main

media_folder: "public/images/uploads"
public_folder: "/images/uploads"

collections:
  - name: "events"
    label: "Événements"
    folder: "src/content/events"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Titre", name: "title", widget: "string" }
      - { label: "Date", name: "date", widget: "datetime" }
      - { label: "Lieu", name: "location", widget: "string" }
      - { label: "Résumé", name: "summary", widget: "text" }
      - { label: "Contenu", name: "body", widget: "markdown" }
```

---

# Setup GitHub Repository

## Étapes

1. Créer un repository GitHub
2. Push le projet Astro
3. Vérifier que le projet build localement

---

# Setup GitHub Pages

## Activer GitHub Pages

Dans GitHub :

Settings → Pages

Configurer :
- source : GitHub Actions

---

# GitHub Actions

Créer :

```txt
.github/workflows/deploy.yml
```

---

## Exemple minimal

```yaml
name: Deploy Astro to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm install
      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

# Configuration domaine personnalisé

## Registrar recommandé

Possible chez :
- OVHcloud
- Gandi
- Infomaniak

---

## DNS GitHub Pages

Configurer :

```txt
CNAME www -> USER.github.io
```

Et éventuellement :

```txt
A records -> GitHub Pages IPs
```

---

# Setup GitHub OAuth pour Decap CMS

## IMPORTANT

C’est la partie la plus technique.

---

## Créer une GitHub OAuth App

Dans GitHub Developer Settings :

Créer une OAuth App.

Configurer :

```txt
Homepage URL:
https://www.example.org

Authorization callback URL:
https://api.netlify.com/auth/done
```

NOTE :
Le setup exact dépendra de la stratégie OAuth choisie.

---

# Alternative possible

Si le setup OAuth devient trop complexe :

Alternative acceptable :
- supprimer Decap CMS
- éditer directement les fichiers Markdown via GitHub Web UI

Cela réduit encore :
- la complexité
- les dépendances
- la maintenance

Mais demande des bénévoles un peu plus techniques.

---

# Expérience utilisateur attendue pour les bénévoles

Les bénévoles doivent pouvoir :
- ajouter un événement
- modifier une FAQ
- ajouter un PDF
- modifier une page simple
- ajouter un lien presse

Sans écrire de code.

---

# Performance attendue

Objectifs :

- Lighthouse > 90
- poids minimal
- First Contentful Paint rapide
- très peu de JavaScript

---

# Style attendu

Le site doit être :
- minimaliste
- élégant
- lisible
- sobre
- moderne

Inspiration possible :
- sites institutionnels modernes
- design éditorial simple
- approche low-tech web

---

# Livrables attendus

Codex doit produire :

1. Le projet Astro complet
2. Le setup Tailwind
3. Le setup Decap CMS
4. Les collections Astro
5. Les pages du site
6. La carte Leaflet
7. Le workflow GitHub Actions
8. Le README d’installation
9. Les instructions de déploiement
10. Une structure propre et maintenable

---

# Critère principal de réussite

Le site doit rester :
- extrêmement léger
- durable
- maintenable longtemps
- simple pour des bénévoles
- simple à héberger
- simple à faire évoluer

