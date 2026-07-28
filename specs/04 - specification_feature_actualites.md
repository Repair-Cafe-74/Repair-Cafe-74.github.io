# Specification - Actualites

## Objectif

Permettre a l'association de publier des actualites (articles Markdown) et de les afficher :

- sur une page liste `/actualites` ;
- sur une page detail par article `/actualites/[slug]` ;
- en teaser sur la page d'accueil, sous conditions.

La rubrique est distincte de **Presse** : Presse regroupe les mentions externes ; Actualites regroupe ce que l'association publie elle-meme.

## Navigation

Une entree `Actualites` est ajoutee au menu principal (`src/layouts/BaseLayout.astro`), entre `Ou ?` et `FAQ`.

## Source de donnees

Les articles sont lus depuis la collection Astro `news` (`src/content/news/`).

Chaque fichier Markdown expose le frontmatter suivant :

- `title` : titre de l'article ;
- `date` : date de publication ;
- `summary` : resume court (liste, teaser d'accueil, meta description) ;
- `author` : auteur en texte libre ;
- contenu Markdown : corps de l'article.

Pas d'image de couverture, pas de statut brouillon, pas de date de publication future distincte de `date`.

## Edition via Decap CMS

La collection Decap `news` (label `Actualites`) est configuree dans `public/admin/config.yml`.

Champs editables :

- Titre ;
- Date ;
- Resume ;
- Auteur ;
- Contenu (Markdown).

Les fichiers sont ecrits dans `src/content/news/`.

## Page liste `/actualites`

Fichier : `src/pages/actualites/index.astro`.

Comportement :

- charge la collection `news` ;
- trie du plus recent au plus ancien (`date` decroissante) ;
- affiche chaque article via le composant `NewsCard` (titre, date, auteur, resume, lien vers le detail) ;
- si la collection est vide, affiche un message d'etat vide.

### Pagination "Charger plus"

- 5 articles visibles au depart ;
- les articles suivants sont presentes dans le HTML mais masques ;
- un bouton `Charger plus` revele 5 articles supplementaires a chaque clic ;
- le bouton disparait quand tous les articles sont visibles ;
- pas d'API : script client leger, adapte au site statique.

## Page detail `/actualites/[slug]`

Fichier : `src/pages/actualites/[slug].astro`.

Comportement :

- `getStaticPaths` genere une page par article ;
- affiche le titre, la date, l'auteur, le resume, puis le corps Markdown (`prose-content`) ;
- la meta description reprend le `summary` ;
- un lien permet de revenir a la liste.

## Teaser sur la page d'accueil

Fichier : `src/pages/index.astro`.

Placement : entre la section Hero et la section `Prochains rendez-vous`.

Regle d'affichage :

- on prend l'article le plus recent ;
- la section est visible **si et seulement si** sa date a moins de 3 mois (seuil : 91 jours) ;
- sinon, la section est entierement absente.

Contenu du teaser :

- titre, date, auteur, resume ;
- lien vers l'article ;
- lien `Toutes les actualites` vers `/actualites`.

## Implementation

Fichiers principaux :

- schema : `src/content/config.ts` (collection `news`) ;
- CMS : `public/admin/config.yml` ;
- carte liste : `src/components/NewsCard.astro` ;
- pages : `src/pages/actualites/index.astro`, `src/pages/actualites/[slug].astro` ;
- navigation : `src/layouts/BaseLayout.astro` ;
- teaser : `src/pages/index.astro`.

## Hors perimetre

- image de couverture ;
- brouillons / publication programmee ;
- flux RSS ;
- pagination serveur.
