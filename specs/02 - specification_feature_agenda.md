# Specification - Agenda

## Objectif

La page Agenda affiche, sur les 12 prochains mois, trois familles d'evenements :

- les permanences recurrentes des Repair Cafes, inferees depuis les fiches `locations` ;
- les permanences ponctuelles, decrites dans les fiches `permanences` ;
- les evenements ponctuels, decrits dans les fiches `events`.

L'affichage est un calendrier mensuel navigable.

## Sources de donnees

### Permanences recurrentes

Les permanences recurrentes sont generees depuis la collection `locations`.

Champs utilises :

- `name` : nom affiche dans le calendrier ;
- `address` : adresse affichee dans la bulle de detail ;
- `hours` : texte utilise pour inferer les occurrences ;
- `link` : lien optionnel affiche dans la bulle ;
- contenu Markdown de la fiche : texte complementaire affiche dans la bulle s'il est disponible.

### Permanences ponctuelles

Les permanences ponctuelles sont lues depuis la collection `permanences`.

Champs utilises :

- `date` : date et heure de la session ;
- `repairCafe` : slug optionnel d'une fiche `locations` ;
- `title` : titre affiche, obligatoire si `repairCafe` est absent, sinon surcharge optionnelle ;
- `location` : adresse affichee, obligatoire si `repairCafe` est absent, sinon surcharge optionnelle ;
- `summary` : resume affiche dans la bulle ;
- contenu Markdown de la fiche : texte complementaire affiche dans la bulle s'il est disponible.

Si `repairCafe` est renseigne, le nom et l'adresse du Repair Cafe sont repris depuis la fiche `locations`, sauf surcharge via `title` ou `location`.

### Evenements ponctuels

Les evenements ponctuels sont lus depuis la collection `events`.

Champs utilises :

- `title` : titre affiche dans le calendrier ;
- `date` : date et heure de debut ;
- `location` : lieu affiche dans le calendrier et la bulle ;
- `summary` : resume affiche dans la bulle ;
- contenu Markdown de la fiche : texte complementaire affiche dans la bulle s'il est disponible.

## Periode generee

Au moment de la generation du site, l'agenda calcule les occurrences a partir du mois courant et jusqu'au debut du treizieme mois.

Exemple : si le site est genere le 8 juin 2026, les mois affiches vont de juin 2026 a mai 2027 inclus. Les occurrences anterieures au jour de generation ne sont pas affichees.

## Regles d'inference des permanences

Le generateur parse le champ `hours` des fiches `locations`.

Formes prises en charge :

- recurrence hebdomadaire : `Tous les jeudis`, `chaque mercredi` ;
- nieme jour du mois : `1er samedi`, `2e samedi`, `3e samedi`, `4e samedi` ;
- plusieurs occurrences mensuelles : `1er et 3e samedis du mois` ;
- dernier jour du mois : `Dernier jeudi`, `Dernier mercredi`, `Dernier samedi` ;
- mois pairs ou impairs : `chaque mois pair`, `chaque mois impair` ;
- semaines ISO paires : `Mardis des semaines paires` ;
- exclusions de mois : `sauf juillet et aout`, `sauf juillet, aout et decembre` ;
- plage saisonniere : `d'octobre a juin`.

L'heure de debut est inferee depuis le premier horaire de type `9h-12h`, `8h30-12h`, `16h30-20h`, etc.

Limite connue : si une fiche ne contient pas d'heure de debut, l'entree reste affichee dans le calendrier avec le libelle `Horaire a confirmer`.

## Affichage calendrier

Le calendrier affiche un seul mois a la fois.

Navigation :

- fleche gauche : mois precedent ;
- fleche droite : mois suivant ;
- le titre central affiche le mois actif.

Les boutons de navigation sont desactives au premier et au dernier mois de la periode generee.

## Affichage des entrees

Une legende indique le code couleur et sert de filtre :

- vert : permanence ;
- orange : evenement.

Chaque element de legende est cliquable. Un clic masque ou affiche les entrees du type correspondant dans le calendrier.

Pour une permanence, l'entree affiche :

- l'heure de debut ;
- le nom du Repair Cafe (`name`).

Pour un evenement ponctuel, l'entree affiche :

- l'heure de debut ;
- le titre (`title`) ;
- le lieu (`location`).

## Bulles de detail

Au clic sur une entree du calendrier, une bulle s'affiche au-dessus du calendrier.

Pour une permanence recurrente, la bulle affiche les informations de la fiche `location` :

- nom ;
- adresse ;
- horaires ;
- lien optionnel ;
- contenu Markdown, s'il est disponible.

Pour une permanence ponctuelle, la bulle affiche les informations de la fiche `permanence` :

- nom (depuis `title` ou la fiche `location` liee) ;
- date complete et heure ;
- adresse (depuis `location` ou la fiche `location` liee) ;
- horaires recurrents et lien web de la fiche `location` liee, si `repairCafe` est renseigne ;
- resume ;
- contenu Markdown de la permanence, s'il est disponible ;
- contenu Markdown de la fiche `location` liee, s'il est disponible.

Pour un evenement ponctuel, la bulle affiche les informations de la fiche `event` :

- titre ;
- date complete et heure ;
- lieu ;
- resume ;
- contenu Markdown, s'il est disponible.

La bulle dispose d'un bouton de fermeture.

## Responsive

Sur ordinateur, le calendrier garde une grille hebdomadaire classique en 7 colonnes.

Sur smartphone, le mois actif est transforme en liste verticale des jours contenant au moins une entree. Les jours vides sont masques afin d'eviter le defilement horizontal et les cases trop etroites.

## Implementation

La logique de generation est centralisee dans `src/lib/agenda.ts`.

La page `src/pages/agenda.astro` :

- charge les collections `events`, `locations` et `permanences` ;
- genere les occurrences ;
- construit les 12 mois ;
- rend les templates de detail cote serveur ;
- gere la navigation mensuelle, les filtres de legende et l'ouverture des bulles avec un script client leger.
