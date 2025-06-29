# Documentation : Le Moteur d'Affectation

**Propriétaire :** `app/Services/ExamAssignmentService.php`

## 1. Objectif

Le Moteur d'Affectation est le système automatisé central responsable d'affecter les professeurs aux examens non pourvus pour une session donnée. Son objectif principal est de pourvoir tous les créneaux requis tout en respectant strictement un ensemble complexe de règles métier et d'équité.

Il est conçu comme un **service à état**, ce qui signifie qu'il charge toutes les données nécessaires en mémoire au début d'une exécution par lots et gère l'état en interne pour prendre des décisions.

## 2. Flux de Travail de Haut Niveau

Le moteur est déclenché en appelant la méthode `assignExamsForSeson(Seson $seson)`. Le processus est le suivant :

1.  **Initialisation :** Le service appelle `initializeBatchState()` pour charger toutes les affectations existantes pour la session donnée dans un tableau en mémoire (`$profAssignmentsInSessionTotal`). Ceci est utilisé pour vérifier les quotas à l'échelle de la session.
2.  **Récupération des Données :** Il récupère tous les professeurs `Active` et tous les `Exams` qui nécessitent une affectation pour la session donnée.
3.  **Affectation Itérative :** Il parcourt chaque examen non pourvu un par un, par ordre chronologique.
4.  **Traitement par Examen :** Pour chaque examen, il appelle `assignSingleExamInBatch()`. Cette méthode itère sur chaque salle requise (`salle`) et chaque créneau requis dans cette salle.
5.  **Filtrage des Candidats :** Pour chaque créneau, il construit un pool de professeurs disponibles et les filtre à l'aide de la méthode `filterCandidatesForExamInBatch()`, qui applique toutes les règles énumérées ci-dessous.
6.  **Sélection et Création :** Parmi le pool final de candidats valides, il sélectionne le meilleur en utilisant `selectResponsable()` ou `selectInvigilator()` et crée l'enregistrement `Attribution` dans la base de données.
7.  **Mise à Jour de l'État :** Après avoir créé une affectation, il met à jour son état interne (`$profAssignmentsInSessionTotal` et `$professorsAssignedToCurrentExamOverall`) pour s'assurer que les décisions ultérieures dans la même exécution par lots sont prises avec les informations les plus récentes.

---

## 3. Règles d'Affectation Principales

La méthode `filterCandidatesForExamInBatch()` est le cerveau du moteur. Elle filtrera tout professeur qui enfreint l'une des règles suivantes, approximativement dans cet ordre :

### Règle 1 : Disponibilité Générale
-   Un professeur doit avoir un `statut` `'Active'`.
-   Un professeur ne doit pas être Chef de Service (`is_chef_service = false`).
-   Un professeur ne doit pas avoir d'enregistrement `Unavailability` qui chevauche l'heure de début et de fin de l'examen.

### Règle 2 : Limites Quotidiennes et de Proximité
-   **Maximum par Jour :** Un professeur ne peut pas être affecté à plus d'un examen par jour. La constante `MAX_ASSIGNMENTS_PER_DAY` est actuellement définie à `1`.
-   **Jours d'Intervalle :** Un professeur ne peut pas être affecté à un examen s'il a déjà une affectation le jour immédiatement précédent ou suivant. La constante `ASSIGNMENT_GAP_DAYS` est actuellement définie à `1`.

### Règle 3 : Quotas à l'Échelle de la Session
-   Chaque grade de professeur a un nombre maximum d'affectations qu'il peut avoir pour la *session entière*. Ceci afin d'assurer une répartition équitable de la charge.
-   Les quotas sont définis dans la constante `RANK_QUOTAS_PER_SESSION` :
    -   `PES` : 2 affectations par session
    -   `PAG` : 4 affectations par session
    -   `PA` : 6 affectations par session
-   Le moteur vérifie le total des affectations du professeur (à la fois préexistantes et celles effectuées pendant l'exécution par lots actuelle) par rapport à ce quota.

---

## 4. Sélection et Priorisation des Candidats

Après qu'un pool de candidats valides est établi, le moteur utilise deux méthodes pour sélectionner le meilleur : `selectResponsable()` et `selectInvigilator()`.

### Sélection du Responsable (`selectResponsable`)
-   Le premier créneau dans une salle donnée est toujours affecté au rôle de "Responsable".
-   La sélection est basée sur une hiérarchie stricte :
    1.  **Grade :** `PES` > `PAG` > `PA`.
    2.  **Date de Recrutement :** En cas d'égalité, le professeur ayant la date de recrutement la plus ancienne est choisi.

### Sélection de l'Invigilateur (`selectInvigilator`)
-   Tous les créneaux suivants sont affectés au rôle d'"Invigilateur".
-   La sélection utilise un système de score pondéré pour prioriser certains professeurs :
    1.  **Priorité de l'Enseignant du Module :** La méthode `determineCandidatePool()` vérifie d'abord si un enseignant du module est déjà affecté à l'examen. Si ce n'est pas le cas, elle ne considérera **que** les autres professeurs qui enseignent ce module. C'est la priorité la plus élevée.
    2.  **Préférence de Spécialité/Heure :**
        -   Les spécialistes médicaux (`specialite = 'medical'`) sont prioritaires pour les examens du matin (avant 13h00).
        -   Les spécialistes chirurgicaux (`specialite = 'surgical'`) sont prioritaires pour les examens de l'après-midi.
    3.  **Grade :** Les professeurs de rang inférieur (`PA`) sont généralement préférés pour les rôles d'invigilateur afin de réserver les professeurs de rang supérieur pour les rôles de responsable.

## 5. Comportements Connus et Cas Limites
-   Le moteur traite les examens chronologiquement. Cela signifie qu'un examen du lundi sera entièrement pourvu avant même qu'un examen du mardi ne soit pris en compte.
-   Si aucun candidat approprié ne peut être trouvé pour un créneau, il sera laissé vide et l'examen sera marqué comme comportant des erreurs dans le résumé final. Le moteur ne plantera pas.
