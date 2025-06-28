# Documentation: Core Database Schema

This document provides a high-level overview of the core database relationships in the PROXAM application.

## Entity-Relationship Diagram (ERD)

The following diagram illustrates the primary relationships between Users, Professors, Exams, and the academic structure.

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

    USERS ||--o{ PROFESSEURS : "has one"
    SERVICES ||--|{ PROFESSEURS : "has many"
    PROFESSEURS ||--|{ ATTRIBUTIONS : "has many"
    PROFESSEURS ||--|{ UNAVAILABILITIES : "has many"
    PROFESSEURS }o--o{ MODULES : "teaches"
    
    EXAMENS ||--|{ ATTRIBUTIONS : "has many"
    MODULES ||--o{ EXAMENS : "has many"
    QUADRIMESTRES ||--o{ EXAMENS : "has many"
    SESONS ||--o{ EXAMENS : "has many"
    
    EXAMENS }o--o{ SALLES : "uses"
    ATTRIBUTIONS }o--|| SALLES : "is in"
    
    LEVELS ||--o{ MODULES : "has many"
    FILIERES ||--o{ LEVELS : "has many"
    
    ANNEE_UNIS ||--o{ SESONS : "has many"
    SESONS ||--o{ QUADRIMESTRES : "has many"
```

## Key Relationships Explained

-   **Users & Professors:** The `users` table handles authentication and roles. Every `professeurs` record **must** have a corresponding `users` record (`one-to-one`). This is the most critical link in the system.
-   **Academic Hierarchy:** The structure is `Filieres` -> `Levels` -> `Modules`. A Study Field has many Levels, and a Level has many Modules. This creates the academic curriculum.
-   **Professors & Modules:** A many-to-many relationship exists via the `professeur_modules` pivot table. This defines which subjects a professor is qualified to teach.
-   **Exams:** An `examens` record is the central event. It belongs to one `Module`, one `Quadrimestre`, and one `Seson`. It can be held in many `Salles` (via the `examens_salles` pivot table).
-   **Attributions (Assignments):** This is the "join" table that connects everything. An `attributions` record links one `Professeur` to one `Examen` in a specific `Salle`. This is the record that represents a single professor's duty on exam day.
-   **Unavailabilities & Conflicts:** An `unavailabilities` record simply belongs to a `Professeur`. The conflict logic works by checking if an `attributions` record's exam time overlaps with any of the professor's `unavailabilities`.