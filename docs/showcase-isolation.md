# Stratégie pour un showcase au design isolé

## Objectif
Créer une vitrine produit dont l'identité visuelle est totalement indépendante du reste du site, tout en restant maintenable et performante.

## Principes clés
1. **Isolation structurelle** : héberger le showcase dans un conteneur dédié (route spécifique, micro-front ou module standalone) pour éviter les collisions de dépendances.
2. **Encapsulation des styles** : s'assurer que les feuilles de style du site principal ne s'appliquent pas au showcase et réciproquement.
3. **Chaîne de build autonome** : permettre au showcase d'embarquer ses assets (CSS/JS) et son thème sans dépendre du bundle global.

## Approches recommandées

### 1. Wrapper physique
- **Iframe dédiée** pour découpler totalement le DOM/CSS. Adapté si l'on accepte un cloisonnement fort (permet de charger un bundle isolé, mais attention aux performances et à l'accessibilité).
- **Micro front-end** : charge le showcase via un module dynamique (Module Federation, import() async). Garantit l'isolation mais nécessite un pipeline CI/CD propre.

### 2. Encapsulation CSS
- **Shadow DOM** : intégrer le showcase dans un Web Component racine (`<showcase-shell>`). Les styles contenus dans le shadow root ne fuient pas vers le reste du site.
- **CSS Modules ou CSS-in-JS scoped** : chaque composant génère des classes uniques (`.Button__primary__hash`). À coupler avec un reset local (`:where(:root) { all: initial; }`) pour repartir d'une base neutre.

### 3. Stratégie de reset locale
- Injecter un **reset CSS minimal** au début du bundle showcase.
- Normaliser la typographie, les couleurs et l'espacement via des **design tokens spécifiques** (`--showcase-color-primary`, `--showcase-font-body`).
- Bannir l'héritage global : préférer `rem` et `em` calculés sur des variables locales.

### 4. Gouvernance des dépendances
- Versionner séparément les librairies UI du showcase (ex. `showcase-theme.css`).
- Automatiser un **visual regression testing** dédié pour valider l'absence de fuites CSS lors de chaque déploiement.
- Documenter les conventions (naming BEM scoped, tokens) afin que chaque contribution respecte l'isolation.

## Checklist de mise en œuvre
- [ ] Créer un conteneur autonome (route /showcase ou iframe).
- [ ] Charger les styles du showcase via un bundle dédié (pas de `link` global partagé).
- [ ] Mettre en place un reset local et des tokens propres au showcase.
- [ ] Tester l'encapsulation (naviguer sur le site, vérifier qu'aucun style ne "fuit").
- [ ] Ajouter un test visuel/automatisé avant chaque mise en production.

## Aller plus loin
- Introduire un **thème dark/light** spécifique au showcase sans impacter le reste du site grâce à des variables CSS encapsulées.
- Exposer le showcase comme **storybook embarqué** pour accélérer la contribution des designers et développeurs.
- Auditer régulièrement les performances (Lighthouse) afin de garantir que l'isolation ne dégrade pas le chargement global.
