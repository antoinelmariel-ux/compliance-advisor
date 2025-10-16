# Stratégie de convergence vers la maquette Aura pour le thème Apple

## 1. Cartographier les écarts structurels
- Inventorier les sections de `aura-showcase-base.html` (hero, bénéfices, preuves, timeline, footer) et les comparer au flux généré par `ShowcaseContent` dans le thème Apple.
- Documenter les composants manquants (ex. navigation secondaire, timeline visuelle) et les dépendances CSS associées.

## 2. Concevoir une architecture React adaptée
- Proposer une arborescence de composants dédiée au thème Apple qui reflète la hiérarchie de la maquette Aura.
- Prévoir une couche de configuration (JSON ou CMS) pour piloter l’ordre et les contenus sans modifier le code.

## 3. Refondre le système de styles
- Extraire les styles existants du thème Apple et identifier ceux pouvant être réutilisés (glassmorphism, animations).
- Créer une feuille de style spécifique « apple-aura.css » calquée sur les classes de la maquette, tout en respectant le design system Apple (typographie SF, grilles responsive, ombres douces).

## 4. Plan de migration incrémentale
- Phase 1 : Introduire le nouveau layout dans une route expérimentale (`/showcase/apple-aura`), en conservant les composants actuels pour le reste du produit.
- Phase 2 : Remplacer progressivement les sections existantes par les nouveaux composants, en activant des feature flags pour sécuriser la transition.
- Phase 3 : Fusionner les feuilles de style et retirer l’ancien canevas une fois la parité atteinte.

## 5. Validation et conformité
- Définir une checklist UX (accessibilité, responsive, performance) alignée sur la maquette de référence.
- Impliquer les équipes brand et conformité pour valider les contenus et assets avant le basculement.

## 6. Communication & suivi
- Documenter l’avancement dans le wiki produit et prévoir une démo hebdomadaire.
- Mettre à jour le footer applicatif avec la version `v1.0.52` une fois la stratégie validée.

## Mise en œuvre initiale (Sprint 1)
- Création d’un layout React dédié (`AppleShowcase`) qui reproduit la structure de `aura-showcase-base.html` : navigation interne, sections héro, grilles et chronologie.
- Ajout d’un socle CSS Aura pour le thème Apple (badge, cartes vitrées, listes empilées, timeline) tout en conservant le traitement visuel « keynote ».
- Synchronisation des versions : `Campagne Aura 0.1.3` pour la maquette, `Thème Apple v1.0.52` côté application.
