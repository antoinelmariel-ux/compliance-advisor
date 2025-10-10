# Compliance Advisor

Cette version du prototype peut être lancée sans outil de build. Ouvrez simplement `index.html` dans un navigateur moderne pour charger l'application React via les CDN. Le fichier `app.jsx` est compilé à la volée par Babel (préréglages `env` et `react`) ce qui permet d'utiliser directement la syntaxe JSX et les fonctionnalités modernes de JavaScript.

## Développement

* Le code principal se trouve dans `app.jsx` et s'appuie sur React/ReactDOM chargés depuis des CDN UMD.
* Les icônes proviennent d'un petit utilitaire `createIcon` qui affiche des emojis, ce qui évite la dépendance à des bibliothèques externes.
* Tailwind CSS est chargé via le CDN `cdn.jsdelivr.net` pour assurer le rendu des classes utilitaires.

Pour modifier le comportement de l'outil, mettez à jour les constantes `initialQuestions`, `initialRules` et `initialTeams` dans `app.jsx`.
