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

## Architecture actuelle du Project Showcase

### Rôle de `ProjectShowcase.jsx`

- centralise la collecte des réponses et la normalisation des formats (dates, listes, scores) en un **payload brut** unique ;
- publie ce payload via un événement `project-showcase:data` et le stocke dans `window.__PROJECT_SHOWCASE_DATA__` pour les scripts externes ;
- persiste la sélection de thème dans le `localStorage` et expose un sélecteur piloté par un mapping `id → composant thématique`.

### Orchestration par thème

- Chaque identité visuelle possède désormais un fichier dédié (`AppleShowcase.jsx`, `NetflixShowcase.jsx`, `AmnestyShowcase.jsx`) qui importe le conteneur décoratif, applique ses classes d'animation et délègue le rendu des sections au composant neutre `ShowcaseContent`.
- Les thèmes branchent un hook `useShowcaseAnimations` pour activer les transitions déclarées dans leur CSS (`animate-on-scroll` → `is-visible`) en respectant le `prefers-reduced-motion`.
- Les ajouts d'un nouveau thème se limitent à fournir un couple `{ThemeContainer, ThemeShowcase}` et, si besoin, une feuille de style complémentaire : aucune duplication de logique métier n'est nécessaire.

### Impacts d'un `ProjectShowcase.jsx` centré sur des contenus bruts

**Bénéfices**

- **Neutralité des données** : en laissant l'orchestrateur ne manipuler que des contenus bruts, chaque thème peut décider de la granularité et de l'ordre d'affichage qui lui convient, sans composer avec des structures HTML pré-imposées.
- **Autonomie stylistique totale** : un thème peut charger ses propres scripts d'animation et feuilles de style sans craindre de casser la mise en forme des autres, puisqu'il reste maître de la construction DOM finale.
- **Évolutivité thématique** : l'ajout d'une nouvelle identité (par exemple un thème « Brutalist ») ne nécessite qu'un composant vitrine spécialisé ; le pipeline de données reste inchangé et déjà éprouvé.

**Points de vigilance**

- **Duplication potentielle des comportements d'UI** : chaque thème devant réimplémenter ses transitions, ses breakpoints et ses interactions, on risque de multiplier des variantes quasi identiques qui seront plus difficiles à harmoniser.
- **Charge d'intégration accrue** : les équipes design/front doivent maintenir des couples CSS/JS distincts, ce qui alourdit les mises à jour transverses (accessibilité, corrections d'animations, perf).
- **Complexité de test** : valider l'expérience utilisateur implique de couvrir chaque thème individuellement (tests visuels, e2e), car un bug peut n'apparaître que dans une combinaison d'animations/d'agencements spécifiques.
