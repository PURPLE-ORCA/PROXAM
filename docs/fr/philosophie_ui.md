# Documentation : Philosophie et Modèles d'Interface Utilisateur

## 1. Objectif

Ce document décrit les principes fondamentaux et les modèles récurrents utilisés dans le frontend de l'application PROFS2EXAMS. Son but est de garantir que le développement futur maintienne une expérience utilisateur cohérente, prévisible et de haute qualité. L'adhésion à ces modèles accélérera le développement et réduira les bogues liés à l'interface utilisateur.

## 2. Principes Fondamentaux

-   **La Cohérence est Reine :** L'application utilise une seule bibliothèque de composants (`shadcn/ui`) pour tous les éléments d'interface utilisateur principaux (boutons, modales, entrées, etc.). Cela garantit une apparence et une convivialité cohérentes sur l'ensemble de la plateforme.
-   **La Performance Avant Tout :** Toutes les listes et tableaux à forte densité de données s'appuient sur le backend Laravel pour la pagination, le tri et le filtrage côté serveur. Cela évite que le frontend ne soit ralenti par de grands ensembles de données et garantit que l'interface utilisateur reste rapide et réactive.
-   **Clarté avant l'Esthétique :** L'interface utilisateur privilégie l'affichage d'informations claires et non ambiguës. Bien qu'esthétiquement épuré, le design évite les animations inutiles ou les mises en page complexes qui pourraient dérouter l'utilisateur ou masquer des informations importantes.
-   **Réutilisabilité des Composants :** Les éléments d'interface utilisateur courants (par exemple, tableaux de données, barres d'outils simples, modales) sont construits comme des composants génériques et réutilisables pour renforcer la cohérence et accélérer le développement de nouvelles fonctionnalités.

---

## 3. Modèles Clés d'UI/UX

Ce sont les modèles établis qui doivent être suivis lors de la création de nouvelles fonctionnalités.

### 3.1. Le Centre de Contrôle

-   **Concept :** Pour les utilisateurs ayant des rôles administratifs (Admin, RH, Chef de Service), la page d'atterrissage principale est le **Centre de Contrôle**.
-   **Objectif :** Il agit comme un hub de navigation central, donnant accès à tous les modules de gestion.
-   **Barre de Contexte :** Le Centre de Contrôle dispose d'une "Barre de Contexte" dédiée en haut. Cette barre contient les contrôles au niveau de la session comme le sélecteur d'Année Universitaire, le menu utilisateur et le sélecteur de thème. Cela désencombre l'en-tête global et place les actions de définition de contexte là où le flux de travail de l'utilisateur commence.

### 3.2. Modales vs. Formulaires Pleine Page

Une distinction claire est faite pour optimiser l'expérience utilisateur lors de la saisie de données.

-   **Les Modales sont pour le CRUD Simple :** Pour les opérations de Création/Mise à jour simples (par exemple, Services, Salles, Utilisateurs), les formulaires sont présentés à l'intérieur d'une **Modale (`Dialog`)**. Cela offre une expérience d'édition rapide et en contexte sans rechargement complet de la page. Le modèle standard est `Page d'Index -> Modale -> Formulaire`.
-   **Les Pages Complètes sont pour les Formulaires Complexes :** Pour les modèles de données complexes avec de nombreux champs et relations (par exemple, Professeurs, Examens), les formulaires ont leurs propres pages dédiées (par exemple, `/professeurs/create`). Cela évite une expérience modale exiguë et confuse et permet des éléments d'interface utilisateur et des mises en page plus complexes.

### 3.3. La Stratégie de Tableau Hybride

L'application utilise deux composants de tableau différents, choisis en fonction de la complexité des données affichées.

-   **`MaterialReactTable` (MRT) :** Utilisé pour les pages à forte densité de données avec des besoins de filtrage complexes, comme la liste principale des **Professeurs**. MRT offre de puissantes fonctionnalités intégrées pour le filtrage multi-colonnes, le redimensionnement des colonnes, et plus encore, qui sont essentielles pour ce type de vue.
-   **`DataTable` Personnalisé :** Utilisé pour la plupart des autres pages CRUD (par exemple, Utilisateurs, Affectations). Il s'agit d'un tableau léger, construit sur mesure à l'aide de composants `shadcn/ui`. Il est conçu pour la clarté et la performance, avec des fonctionnalités telles que la pagination et le tri côté serveur, et est associé à des barres d'outils dédiées pour le filtrage.

### 3.4. Tableaux Visuellement Groupés

Pour les pages comme les **Affectations**, où les données sont naturellement hiérarchiques (plusieurs professeurs par examen), un design de "ligne fusionnée" est utilisé.
-   **Modèle :** L'enregistrement parent (l'Examen) est affiché une seule fois. Tous les enregistrements enfants (les Professeurs affectés) sont listés en dessous sans répéter les données parentes. Une bordure supérieure sépare visuellement chaque groupe.
-   **Implémentation :** Ceci est réalisé grâce à une logique de rendu personnalisée dans le composant React qui vérifie l'`examen_id` de la ligne précédente pour déterminer s'il doit rendre les détails de l'examen. Le contrôleur backend garantit que les données sont pré-triées par examen pour rendre cela possible.
