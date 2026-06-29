# Configuration des outils Google

## Liens rapides

- Google Search Console : https://search.google.com/search-console?resource_id=sc-domain%3Arepaircafe74.fr
- Google Tag Manager : https://tagmanager.google.com/#/container/accounts/6363412353/containers/256883987/workspaces/3
- Google Analytics : https://analytics.google.com/analytics/web/#/a399398556p543583678/reports/intelligenthome 


## Objectif

Documenter la configuration des services Google utilisés par le site
**repaircafe74.fr**.

## Architecture

``` text
Astro
   │
   ▼
Google Tag Manager (GTM)
   │
   ▼
Google Analytics 4 (GA4)

Google Search Console (GSC)
          │
          └── Suivi SEO et indexation
```

## Google Tag Manager

-   Création d'un compte GTM.
-   Création d'un conteneur Web pour `www.repaircafe74.fr`.
-   Installation du snippet officiel dans `src/layouts/BaseLayout.astro`
    :
    -   le script GTM dans le `<head>` (`<script is:inline>`)
    -   le bloc `<noscript>` immédiatement après l'ouverture du
        `<body>`.
-   Déploiement via GitHub Pages.
-   Vérification avec le mode **Preview** de GTM.

### Remarque

Pendant les tests, Firefox et plusieurs extensions (protection renforcée
contre le pistage / bloqueurs) empêchaient le chargement de GTM. Les
désactiver temporairement a permis de valider l'installation.

## Google Analytics 4

-   Création d'une propriété GA4.
-   Création d'un flux Web pour `https://www.repaircafe74.fr`.
-   Identifiant de mesure : `G-R2MCF9WJ3X`.
-   Aucune balise GA4 n'est installée directement dans Astro.
-   Le suivi passe exclusivement par Google Tag Manager.

### Configuration GTM

Création d'une balise :

-   Type : **Google Tag**
-   Tag ID : `G-R2MCF9WJ3X`
-   Trigger : **Initialization -- All Pages** (ou **All Pages**)

Puis publication du conteneur.

## Google Search Console

-   Création d'une propriété **Domaine** : `repaircafe74.fr`
-   Validation automatique via Gandi (connexion OAuth, création
    automatique du TXT DNS par Google).

Après validation :

-   soumettre le sitemap (`sitemap.xml` ou `sitemap-index.xml` selon la
    configuration Astro) ;
-   utiliser l'inspection d'URL pour demander l'indexation des pages
    principales.

## Conseils de maintenance

-   GTM est le point d'entrée de tous les outils de mesure.
-   Ne pas intégrer directement d'autres scripts de tracking dans Astro.
-   Ajouter les futurs tags (Analytics, Clarity, Meta Pixel, événements
    personnalisés...) via GTM.
-   Vérifier régulièrement :
    -   Search Console (erreurs d'indexation, couverture, performances)
    -   Analytics (trafic)
    -   GTM (versions publiées)

## Améliorations prévues

-   Mettre en place une bannière de consentement RGPD compatible CNIL.
-   Déclencher Analytics uniquement après consentement.
-   Exclure le trafic des administrateurs.
-   Ajouter des événements personnalisés (clics, téléchargements,
    formulaires).
-   Lier Search Console à Google Analytics.

## Dépannage

Si GTM ou GA4 semblent ne pas fonctionner :

1.  vérifier que les bloqueurs de publicité sont désactivés pour les
    tests ;
2.  vérifier la protection contre le pistage de Firefox ;
3.  utiliser le mode Preview de GTM ;
4.  vérifier les rapports Temps réel de GA4.
