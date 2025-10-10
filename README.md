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

## Pistes de nouvelles fonctionnalités

### Expérience utilisateur
- **Guidage contextuel** : tutoriels intégrés et micro-contenus d'aide pour expliquer la logique des questions ou des règles qui s'affichent.
- **Mode brouillon** : permettre aux chefs de projet de sauvegarder plusieurs scénarios de réponses et d'y revenir plus tard avant validation définitive.
- **Accessibilité renforcée** : vérifier la conformité RGAA/WCAG (navigation clavier, contraste, lecteurs d'écran) et proposer un mode haute visibilité.

### Collaboration et gouvernance
- **Gestion multi-utilisateurs** : comptes personnalisés avec historique des parcours remplis et possibilité de commenter les réponses.
- **Workflow de validation** : soumission à un expert compliance, attribution des dossiers et suivi des statuts (à traiter, en revue, validé).
- **Notifications et rappels** : envoi d'e-mails ou intégration Teams pour notifier les parties prenantes lors des changements de statut ou des échéances.

### Analyse et reporting
- **Tableau de bord synthétique** : statistiques sur les projets (volume, niveau de risque, équipes sollicitées) avec filtres temporels.
- **Export des rapports** : génération PDF/Excel des synthèses et des risques pour diffusion aux comités de pilotage.
- **Mesure de complétude** : indicateurs de qualité des réponses (taux de questions optionnelles renseignées, temps moyen de complétion).

### Intégrations techniques
- **Connexion aux référentiels internes** : synchroniser les informations des équipes, règles ou contacts avec les systèmes maîtres (CRM, annuaires).
- **API REST/GraphQL** : exposer les données collectées pour alimenter d'autres outils internes ou automatiser des relances.
- **Authentification d'entreprise** : support SSO (Azure AD/Okta) pour sécuriser l'accès et tracer les opérations sensibles.

## Démarrage
Aucune étape de build n'est nécessaire :
1. Ouvrir `index.html` dans un navigateur moderne.
2. Le fichier `app.js` est compilé à la volée par Babel (préréglages `env` et `react`).
3. React/ReactDOM et Tailwind CSS sont chargés via CDN UMD.

## Personnalisation
- L'ensemble des référentiels (questions, règles, équipes) est éditable directement depuis le back-office intégré.
- Pour des modifications structurelles plus poussées, adaptez `initialQuestions`, `initialRules` et `initialTeams` dans `app.js`.
