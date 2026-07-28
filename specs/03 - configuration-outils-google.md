# Configuration des outils Google

## Liens rapides

- Google Search Console : https://search.google.com/search-console?resource_id=sc-domain%3Arepaircafe74.fr
- Google Tag Manager : https://tagmanager.google.com/#/container/accounts/6363412353/containers/256883987/workspaces/3
- Google Analytics : https://analytics.google.com/analytics/web/#/a399398556p543583678/reports/intelligenthome

## Objectif

Documenter la configuration des services Google utilisés par le site
**repaircafe74.fr**, y compris le consentement cookies (RGPD) et Google
Consent Mode v2.

## Architecture

``` text
Astro (BaseLayout)
   │
   ├── Google Consent Mode v2 (default / update) ──► dataLayer
   ├── Bannière cookies (vanilla-cookieconsent)
   │        └── événement dataLayer: analytics_consent_granted
   │
   ▼
Google Tag Manager (GTM-TCZLRG58)
   │
   ▼
Google Analytics 4 (G-R2MCF9WJ3X)

Google Search Console (GSC)
          │
          └── Suivi SEO et indexation
```

## Implémentation côté site (Astro)

| Fichier | Rôle |
| --- | --- |
| `src/config/analytics.ts` | ID conteneur GTM (`GTM-TCZLRG58`) |
| `src/config/cookie-consent.ts` | Config bannière, callbacks Consent Mode, événement GTM |
| `src/components/GoogleConsent.astro` | Consent Mode par défaut + snippet GTM dans le `<head>` |
| `src/components/CookieConsent.astro` | Initialisation `vanilla-cookieconsent` |
| `src/styles/cookie-consent.css` | Personnalisation visuelle (charte Repair Café 74) |
| `src/layouts/BaseLayout.astro` | Intégration GTM / bannière, liens footer |
| `src/pages/confidentialite.astro` | Politique de confidentialité (`/confidentialite`) |

Dépendance npm : `vanilla-cookieconsent` (vanilla JS, sans React/Vue).

### Flux de consentement

1. **Avant GTM** : `gtag('consent', 'default', …)` avec `analytics_storage: denied`
   (sauf si le cookie `cc_cookie` indique déjà un consentement analytics).
2. **Chargement GTM** : le conteneur se charge ; les balises soumises au consentement
   attendent `analytics_storage: granted`.
3. **Première visite** : bannière Accepter / Refuser / Préférences.
4. **Acceptation analytics** :
   - `gtag('consent', 'update', { analytics_storage: 'granted', … })`
   - `dataLayer.push({ event: 'analytics_consent_granted' })` (uniquement si la
     catégorie `analytics` vient de changer — pas à chaque rechargement de page).
5. **Visites suivantes** : lecture synchrone de `cc_cookie` dans le `<head>` pour
   accorder `analytics_storage` avant GTM si l’utilisateur avait déjà accepté.

Cookie de choix utilisateur : `cc_cookie` (plugin vanilla-cookieconsent).

## Google Tag Manager

- Compte GTM et conteneur Web pour `www.repaircafe74.fr`.
- ID conteneur : **GTM-TCZLRG58**.
- Snippet GTM : composant `GoogleConsent.astro`, inclus depuis `BaseLayout.astro`.
- Bloc `<noscript>` iframe GTM après ouverture du `<body>`.
- Déploiement via GitHub Pages.
- Vérification : mode **Preview** GTM et rapport **Temps réel** GA4.

### Remarque navigateurs

Pendant les tests, Firefox (protection renforcée contre le pistage) et les
extensions bloqueuses peuvent afficher des requêtes `collect` comme **Bloquées**
dans les DevTools sans que la configuration soit incorrecte. Tester aussi avec
Chrome sans extension, ou avec une exception pour le site.

## Google Analytics 4

- Propriété GA4, flux Web `https://www.repaircafe74.fr`.
- Identifiant de mesure : **G-R2MCF9WJ3X**.
- Aucune balise GA4 directe dans Astro : tout passe par GTM.

### Configuration GTM (balise Google Tag)

- Type : **Google Tag**
- Tag ID : `G-R2MCF9WJ3X`
- **Consent Settings** : **Require additional consent for tag to fire** →
  `analytics_storage`
- **Déclencheurs** (les deux sont nécessaires avec Consent Mode + bannière) :
  1. **All Pages** (Page View) — visiteurs ayant déjà consenti (cookie lu dans le
     `<head>`).
  2. **Custom Event** — nom d’événement : **`analytics_consent_granted`** —
     premier consentement sur la page (clic « Tout accepter » ou activation
     analytics dans Préférences).

Puis **publier** le conteneur.

#### Pièges connus

- **Initialization – All Pages** (`gtm.init`) : la balise est évaluée une seule
  fois, souvent alors que `analytics_storage` est encore `denied` → pas de hit
  `collect` après acceptation.
- Il **n’existe pas** de déclencheur GTM natif « Consent Update » dans
  l’interface. L’événement personnalisé `analytics_consent_granted` remplace ce
  besoin.
- **Consent Initialization – All Pages** sert aux balises qui *définissent* le
  consentement (CMP), pas à la balise GA4 de mesure.

## Google Search Console

- Propriété **Domaine** : `repaircafe74.fr`
- Validation via Gandi (TXT DNS).

Après validation :

- soumettre le sitemap (`sitemap-index.xml`) ;
- inspection d’URL pour les pages principales.

## Politique de confidentialité

- Page publique : **`/confidentialite`**
- Liens depuis le footer (« Politique de confidentialité ») et la bannière cookies.
- Lien « Gérer mes cookies » dans le footer (`data-cc="show-preferencesModal"`).

## Conseils de maintenance

- GTM reste le point d’entrée de tous les futurs tags (Ads, Clarity, pixels…).
- Ne pas ajouter de scripts de mesure directement dans Astro.
- Vérifier régulièrement :
  - Search Console (indexation, performances)
  - GA4 Temps réel puis rapports standard (délai 24–48 h)
  - GTM (versions publiées)
- Lors d’un changement de domaine (ex. migration vers `repaircafe.fr`), mettre à
  jour le flux GA4, GSC et les URLs mentionnées dans la politique de
  confidentialité.

## Améliorations prévues

- Exclure le trafic des administrateurs (filtre interne GA4).
- Ajouter des événements personnalisés (clics, téléchargements, formulaires).
- Lier Search Console à Google Analytics.

## Dépannage

### GA4 Temps réel vide

1. Désactiver bloqueurs / protection pistage pour le test.
2. Accepter les cookies analytics sur le site.
3. GTM Preview : la balise Google Tag doit apparaître dans **Tags Fired** après
   acceptation ou au chargement si cookie déjà présent.
4. Network : filtrer `collect` ou `google-analytics.com`.

### Bandeau « Data collection isn't active » (détails du flux Web)

Peut rester affiché alors que **Temps réel** fonctionne (retard de l’heuristique
Google, surtout avec GTM + consentement différé). Fiabilité opérationnelle :
**Rapports → Temps réel** et, après 24–48 h, les rapports standard. Utiliser
**Tag Assistant** depuis la fiche du flux Web après consentement.

### Avertissement console Firefox sur `expires` (`_ga_*`)

Message fréquent quand GA4 met à jour la date d’expiration du cookie à chaque
page vue. En général **sans impact** sur les statistiques. Vérifier qu’une seule
balise Google Tag `G-R2MCF9WJ3X` est active dans GTM.

### GTM / GA4 ne semblent pas fonctionner

1. Conteneur GTM **publié** (pas seulement enregistré en brouillon).
2. Déclencheurs **All Pages** + **analytics_consent_granted** sur la balise GA4.
3. Mode Preview GTM + rapport Temps réel GA4.
4. Firefox / extensions : ne pas conclure à une panne si la requête est seulement
   « Bloquée » côté navigateur.
