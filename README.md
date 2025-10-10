# Compliance Advisor

Prototype React monopage d'aide à la décision compliance lancé directement depuis `index.html`.

## Fonctionnalités principales

### Parcours Chef de Projet
- **Questionnaire adaptatif** : les questions s'affichent dynamiquement selon les réponses précédentes grâce au moteur de conditions (`equals`, `not_equals`, `contains`).
- **Progression guidée** : suivi d'avancement, navigation précédent/suivant et validation des réponses obligatoires.
- **Synthèse automatique** : génération d'un rapport qui récapitule le périmètre du projet, le niveau de complexité compliance et les équipes à mobiliser.
- **Recommandations ciblées** : affichage des contacts, expertises et questions à préparer pour chaque équipe identifiée.
- **Gestion des risques** : consolidation des risques issus des règles déclenchées avec niveau de criticité, priorité et mesures de mitigation.

### Back-Office
- **Éditeur de questions** : ajout/suppression, modification du libellé, des options, du caractère obligatoire et des conditions d'affichage via glisser-déposer.
- **Éditeur de règles** : configuration des conditions de déclenchement, association des équipes, des questions de relance et des risques.
- **Gestion des équipes** : mise à jour du nom, du contact et du champ d'expertise de chaque équipe interne.
- **Aperçu structuré** : consultation rapide des règles, conditions et risques pour faciliter la maintenance du référentiel.

## Démarrage
Aucune étape de build n'est nécessaire :
1. Ouvrir `index.html` dans un navigateur moderne.
2. Le fichier `app.js` est compilé à la volée par Babel (préréglages `env` et `react`).
3. React/ReactDOM et Tailwind CSS sont chargés via CDN UMD.

## Personnalisation
- L'ensemble des référentiels (questions, règles, équipes) est éditable directement depuis le back-office intégré.
- Pour des modifications structurelles plus poussées, adaptez `initialQuestions`, `initialRules` et `initialTeams` dans `app.js`.
