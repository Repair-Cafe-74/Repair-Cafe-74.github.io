# Initial setup

Ce document résume le setup initial du site Repair Café 74 : déploiement GitHub Pages, Decap CMS, et authentification GitHub via Netlify Functions.

## Architecture retenue

- Site statique : Astro
- Hebergement public : GitHub Pages
- CMS : Decap CMS
- Authentification CMS : GitHub OAuth
- Proxy OAuth : Netlify Functions
- Contenu éditable : fichiers Markdown dans `src/content`

Flux general :

1. Un bénévole ouvre `/admin` sur le site GitHub Pages.
2. Decap CMS lance le login GitHub via le proxy OAuth Netlify.
3. GitHub autorise l'application OAuth.
4. Netlify Functions récupère le token GitHub et le renvoie à Decap.
5. Decap CMS commit les modifications Markdown dans le repository GitHub.
6. GitHub Actions reconstruit le site et republie GitHub Pages.

## GitHub

Organisation :

```txt
Repair-Cafe-74
```

Repository du site :

```txt
Repair-Cafe-74/Repair-Cafe-74.github.io
```

URL publique :

```txt
https://repair-cafe-74.github.io
```

Le choix d'un repository `Repair-Cafe-74.github.io` permet d'avoir un site GitHub Pages à la racine du domaine, sans configurer `base` dans Astro.

## GitHub Pages

Dans GitHub :

1. Aller dans `Settings > Pages`.
2. Configurer la source sur `GitHub Actions`.
3. Le workflow `.github/workflows/deploy.yml` construit le site avec `npm run build`.
4. Le dossier publie est `dist`.

## Astro

La configuration principale est dans `astro.config.mjs`.

Le champ `site` doit pointer vers :

```js
site: "https://repair-cafe-74.github.io"
```

Le dossier `.astro/` est généré par Astro et ne doit pas être committé. Il est ignoré dans `.gitignore`.

## Decap CMS

L'admin est exposé sur :

```txt
https://repair-cafe-74.github.io/admin/
```

Configuration :

```txt
public/admin/config.yml
```

Bloc backend :

```yaml
backend:
  name: github
  repo: Repair-Cafe-74/Repair-Cafe-74.github.io
  branch: main
  site_domain: repair-cafe-74.github.io
  base_url: https://repair-cafe-74.netlify.app
  auth_endpoint: auth
```

Notes :

- `repo` indique le repository que Decap CMS modifie.
- `site_domain` indique le domaine public du site Decap.
- `base_url` pointe vers le site Netlify qui héberge le proxy OAuth.
- `auth_endpoint` correspond à la route `/auth`.
- `local_backend: true` permet de tester Decap en local avec `npm run start:all`.

## Netlify

Netlify n'est pas l'hébergeur public du site. Il sert uniquement à héberger le proxy OAuth utilisé par Decap CMS.

Site Netlify :

```txt
https://repair-cafe-74.netlify.app
```

Le projet Netlify peut déployer une copie du site, mais cette URL n'est pas l'URL publique officielle.

## Netlify Functions

Les fonctions sont dans :

```txt
netlify/functions/auth.js
netlify/functions/callback.js
```

Les redirections sont déclarées dans :

```txt
netlify.toml
```

Routes exposees :

```txt
https://repair-cafe-74.netlify.app/auth
https://repair-cafe-74.netlify.app/callback
```

Le flux OAuth utilise ces routes :

1. Decap ouvre `https://repair-cafe-74.netlify.app/auth?provider=github`.
2. La fonction `/auth` redirige vers GitHub OAuth.
3. GitHub renvoie vers `https://repair-cafe-74.netlify.app/callback`.
4. La fonction `/callback` échange le code GitHub contre un token.
5. La fonction renvoie le résultat à Decap CMS via `window.postMessage`.

## Variables d'environnement Netlify

Dans Netlify, configurer :

```txt
GITHUB_OAUTH_CLIENT_ID
GITHUB_OAUTH_CLIENT_SECRET
```

Important :

- `GITHUB_OAUTH_CLIENT_SECRET` doit être marqué comme secret dans Netlify.
- Ne jamais committer le client secret dans le repository.
- Le client ID peut être moins sensible, mais il est quand même gardé en variable d'environnement pour garder la config cohérente.

Variable optionnelle :

```txt
GITHUB_REPO_PRIVATE=true
```

Uniquement si le repository devient privé. Dans ce cas, le proxy demandera le scope GitHub `repo` au lieu de `public_repo`.

## GitHub OAuth App

Créer une OAuth App GitHub.

Configuration :

```txt
Application name:
Decap CMS Repair Café 74

Homepage URL:
https://repair-cafe-74.github.io

Authorization callback URL:
https://repair-cafe-74.netlify.app/callback
```

Le `Client ID` et le `Client Secret` de cette app doivent être ajoutés dans Netlify.

## Nettoyage Netlify

Si un provider OAuth GitHub a été configuré dans l'interface Netlify `Access & security > OAuth`, il n'est plus nécessaire avec le setup actuel.

Le setup actuel utilise les Netlify Functions du repository, pas le broker OAuth intégré `api.netlify.com/auth`.

Il est donc possible de supprimer le provider OAuth GitHub dans l'interface Netlify, à condition de conserver :

- les fonctions Netlify du repository ;
- `netlify.toml` ;
- les variables `GITHUB_OAUTH_CLIENT_ID` et `GITHUB_OAUTH_CLIENT_SECRET`.

## Vérification du setup

Apres chaque changement :

```bash
npm run check
npm run build
```

Pour tester en local :

```bash
npm run start:all
```

Puis ouvrir :

```txt
http://localhost:4321/admin/
```

Pour tester en production :

1. Ouvrir `https://repair-cafe-74.github.io/admin/`.
2. Cliquer sur `Login`.
3. Autoriser l'application GitHub.
4. Modifier un contenu de test.
5. Publier.
6. Vérifier qu'un commit est créé dans GitHub.
7. Vérifier que GitHub Actions redéploie le site.

## Points à revoir plus tard

- Remplacer les contenus fictifs.
- Remplacer les images factices par de vraies photos.
- Travailler le theme graphique et le look & feel.
- Vérifier l'expérience Decap pour des bénévoles non techniques.
- Décider si tous les éditeurs auront un compte GitHub avec accès au repository.
