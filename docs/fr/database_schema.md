# Documentation : Schéma de Base de Données Principal

Ce document fournit un aperçu de haut niveau des relations de base de données principales dans l'application PROXAM.

## Diagramme Entité-Relation (DER)

Le diagramme suivant illustre les relations primaires entre les Utilisateurs, les Professeurs, les Examens et la structure académique.

```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string email
        enum role
    }

    PROFESSEURS {
        int id PK
        int user_id FK
        int service_id FK
        string nom
        string prenom
        enum rang
        enum statut
        bool is_chef_service
    }

    SERVICES {
        int id PK
        string nom
    }

    ATTRIBUTIONS {
        int id PK
        int examen_id FK
        int professeur_id FK
        int salle_id FK
        bool is_responsable
        bool is_in_conflict
    }

    EXAMENS {
        int id PK
        int module_id FK
        int quadrimestre_id FK
        int seson_id FK
        enum type
        datetime debut
    }

    MODULES {
        int id PK
        int level_id FK
        string nom
    }

    LEVELS {
        int id PK
        int filiere_id FK
        string nom
    }

    FILIERES {
        int id PK
        string nom
    }

    UNAVAILABILITIES {
        int id PK
        int professeur_id FK
        datetime start_datetime
        datetime end_datetime
    }
    
    SALLES {
        int id PK
        string nom
    }
    
    SESONS {
        int id PK
        int annee_uni_id FK
        string code
    }
    
    QUADRIMESTRES {
        int id PK
        int seson_id FK
        string code
    }
    
    ANNEE_UNIS {
        int id PK
        string annee
    }

    USERS ||--o{ PROFESSEURS : "a un"
    SERVICES ||--|{ PROFESSEURS : "a plusieurs"
    PROFESSEURS ||--|{ ATTRIBUTIONS : "a plusieurs"
    PROFESSEURS ||--|{ UNAVAILABILITIES : "a plusieurs"
    PROFESSEURS }o--o{ MODULES : "enseigne"
    
    EXAMENS ||--|{ ATTRIBUTIONS : "a plusieurs"
    MODULES ||--o{ EXAMENS : "a plusieurs"
    QUADRIMESTRES ||--o{ EXAMENS : "a plusieurs"
    SESONS ||--o{ EXAMENS : "a plusieurs"
    
    EXAMENS }o--o{ SALLES : "utilise"
    ATTRIBUTIONS }o--|| SALLES : "est dans"
    
    LEVELS ||--o{ MODULES : "a plusieurs"
    FILIERES ||--o{ LEVELS : "a plusieurs"
    
    ANNEE_UNIS ||--o{ SESONS : "a plusieurs"
    SESONS ||--o{ QUADRIMESTRES : "a plusieurs"
```

## Explication des Relations Clés

-   **Utilisateurs et Professeurs :** La table `users` gère l'authentification et les rôles. Chaque enregistrement `professeurs` **doit** avoir un enregistrement `users` correspondant (`un-à-un`). C'est le lien le plus critique du système.
-   **Hiérarchie Académique :** La structure est `Filieres` -> `Levels` -> `Modules`. Un domaine d'études a plusieurs Niveaux, et un Niveau a plusieurs Modules. Cela crée le cursus académique.
-   **Professeurs et Modules :** Une relation plusieurs-à-plusieurs existe via la table pivot `professeur_modules`. Cela définit les matières qu'un professeur est qualifié pour enseigner.
-   **Examens :** Un enregistrement `examens` est l'événement central. Il appartient à un `Module`, un `Quadrimestre` et une `Seson`. Il peut être tenu dans plusieurs `Salles` (via la table pivot `examens_salles`).
-   **Attributions (Affectations) :** C'est la table de "jointure" qui relie tout. Un enregistrement `attributions` lie un `Professeur` à un `Examen` dans une `Salle` spécifique. C'est l'enregistrement qui représente le devoir d'un seul professeur le jour de l'examen.
-   **Indisponibilités et Conflits :** Un enregistrement `unavailabilities` appartient simplement à un `Professeur`. La logique de conflit fonctionne en vérifiant si l'heure d'examen d'un enregistrement `attributions` chevauche l'une des `unavailabilities` du professeur.
