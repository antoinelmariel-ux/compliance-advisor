# Risques potentiels de bugs

## 1. Questions de type « number », « url » ou « file » non prises en charge dans le questionnaire
Le back-office permet de créer des questions avec les types `number`, `url` ou `file`, mais l'écran de questionnaire ne rend que les types `date`, `choice`, `multi_choice`, `text` et `long_text`.【F:src/components/BackOffice.jsx†L10-L43】【F:src/components/QuestionnaireScreen.jsx†L272-L368】

**Impact possible :** lorsqu'un administrateur ajoute une question d'un type non géré, l'utilisateur final n'aura aucun champ pour répondre et ne pourra pas valider une question éventuellement obligatoire, bloquant le parcours.

## 2. Risque de collision d'identifiants lors de l'ajout après suppression
L'ajout d'une question, d'une règle ou d'une équipe génère un identifiant basé uniquement sur la longueur actuelle des listes (`q${questions.length + 1}`, `rule${rules.length + 1}`, `team${teams.length + 1}`).【F:src/components/BackOffice.jsx†L220-L304】 Si un élément intermédiaire est supprimé, le prochain ajout réutilise un identifiant déjà présent (ex. suppression de `q3` puis création d'une nouvelle question -> ID `q8` alors qu'elle existe déjà). 

**Impact possible :** les identifiants sont utilisés comme clés pour les réponses, conditions et règles. Une collision peut provoquer l'écrasement d'une question existante, des incohérences de règles ou un affichage incorrect des réponses persistées.

## 3. Priorité d'équipe calculée à partir du premier risque arbitraire
Dans le rapport de synthèse, la fonction `getTeamPriority` recherche un risque associé à une équipe, mais la condition fournie à `Array.prototype.find` n'utilise pas la variable de boucle `risk` : elle retourne simplement la vérité de `analysis.questions?.[teamId]`. Dès qu'une équipe possède des questions, le premier risque de la liste est renvoyé, quel que soit son lien réel avec l'équipe.【F:src/components/SynthesisReport.jsx†L103-L109】

**Impact possible :** l'interface peut afficher une priorité erronée (ex. « Critique ») pour des équipes qui ne sont pas concernées par les risques identifiés, induisant les utilisateurs en erreur sur l'urgence des actions à mener.

## 4. Échec silencieux de l'encodage UTF-8 en mode dégradé
Le calcul de hachage de secours convertit la chaîne saisie à l'aide de `encodeURIComponent`. Si le navigateur rencontre des caractères invalides (surrogates orphelins, séquences UTF-16 tronquées), l'appel lève une erreur qui est attrapée et remplacée par une chaîne vide. Le mode dégradé calcule alors le SHA-256 d'une entrée vide sans indiquer à l'utilisateur que le mot de passe n'a pas pu être encodé.【F:src/utils/password.js†L7-L97】

**Impact possible :** l'administrateur reçoit simplement un message « mot de passe incorrect » et peut croire que l'authentification échoue, alors que le problème provient de l'encodage côté navigateur. Les mots de passe contenant certains caractères spéciaux pourraient donc être inutilisables dans ces environnements.

## 5. Dépendance à un processus de build hors-ligne
La transformation JSX -> JavaScript est désormais effectuée lors d'une étape de build Node, en s'appuyant sur `Babel Standalone` exécuté côté serveur. Si cette étape est omise avant un déploiement (ou si le dossier `dist/` est effacé), les entrées `index.html` et `presentation.html` importent des modules inexistants (`./dist/main.js`, `./dist/presentation.js`) et l'application reste vide malgré le chargement de React.【F:scripts/build.js†L1-L94】【F:index.html†L108-L115】

**Impact possible :** un déploiement manuel qui oublierait de lancer `node scripts/build.js` pousserait une version inutilisable du site. Documenter cette étape et intégrer une vérification CI est recommandé.
