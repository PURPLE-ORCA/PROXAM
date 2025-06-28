# Documentation: The Assignment Engine

**Owner:** `app/Services/ExamAssignmentService.php`

## 1. Objective

The Assignment Engine is the core automated system responsible for assigning professors to unstaffed exams for a given session. Its primary goal is to fill all required slots while strictly adhering to a complex set of business and fairness rules.

It is designed as a **stateful service**, meaning it loads all necessary data into memory at the beginning of a batch run and manages the state internally to make decisions.

## 2. High-Level Workflow

The engine is triggered by calling the `assignExamsForSeson(Seson $seson)` method. The process is as follows:

1.  **Initialization:** The service calls `initializeBatchState()` to load all existing assignments for the given session into an in-memory array (`$profAssignmentsInSessionTotal`). This is used for checking session-wide quotas.
2.  **Data Fetching:** It fetches all `Active` professors and all `Exams` that need staffing for the given session.
3.  **Iterative Assignment:** It loops through each unstaffed exam one by one, in chronological order.
4.  **Per-Exam Processing:** For each exam, it calls `assignSingleExamInBatch()`. This method iterates through each required room (`salle`) and each required slot within that room.
5.  **Candidate Filtering:** For each slot, it builds a pool of available professors and filters them down using the `filterCandidatesForExamInBatch()` method, which applies all the rules listed below.
6.  **Selection & Creation:** From the final pool of valid candidates, it selects the best one using `selectResponsable()` or `selectInvigilator()` and creates the `Attribution` record in the database.
7.  **State Update:** After creating an assignment, it updates its internal state (`$profAssignmentsInSessionTotal` and `$professorsAssignedToCurrentExamOverall`) to ensure subsequent decisions in the same batch run are made with the most current information.

---

## 3. Core Assignment Rules

The `filterCandidatesForExamInBatch()` method is the brain of the engine. It will filter out any professor who violates one of the following rules, in roughly this order:

### Rule 1: General Availability
-   A professor must have a `statut` of `'Active'`.
-   A professor must not be a Head of Service (`is_chef_service = false`).
-   A professor must not have an `Unavailability` record that overlaps with the exam's start and end time.

### Rule 2: Daily & Proximity Limits
-   **Max Per Day:** A professor cannot be assigned to more than one exam per day. The `MAX_ASSIGNMENTS_PER_DAY` constant is currently set to `1`.
-   **Gap Days:** A professor cannot be assigned to an exam if they already have an assignment on the immediately preceding or following day. The `ASSIGNMENT_GAP_DAYS` constant is currently set to `1`.

### Rule 3: Session-wide Quotas
-   Each professor rank has a maximum number of assignments they can have for the *entire session*. This is to ensure fair load distribution.
-   The quotas are defined in the `RANK_QUOTAS_PER_SESSION` constant:
    -   `PES`: 2 assignments per session
    -   `PAG`: 4 assignments per session
    -   `PA`: 6 assignments per session
-   The engine checks the professor's total assignments (both pre-existing and those made during the current batch run) against this quota.

---

## 4. Candidate Selection & Prioritization

After a pool of valid candidates is established, the engine uses two methods to select the best one: `selectResponsable()` and `selectInvigilator()`.

### Responsable Selection (`selectResponsable`)
-   The first slot in any given room is always assigned the "Responsable" role.
-   Selection is based on a strict hierarchy:
    1.  **Rank:** `PES` > `PAG` > `PA`.
    2.  **Recruitment Date:** As a tie-breaker, the professor with the earliest recruitment date is chosen.

### Invigilator Selection (`selectInvigilator`)
-   All subsequent slots are assigned the "Invigilator" role.
-   Selection uses a weighted scoring system to prioritize certain professors:
    1.  **Module Teacher Priority:** The `determineCandidatePool()` method first checks if a module teacher is already assigned to the exam. If not, it will **only** consider other professors who teach that module. This is the highest priority.
    2.  **Specialty/Time Preference:**
        -   Medical specialists (`specialite = 'medical'`) are prioritized for morning exams (before 13:00).
        -   Surgical specialists (`specialite = 'surgical'`) are prioritized for afternoon exams.
    3.  **Rank:** Lower-ranked professors (`PA`) are generally preferred for invigilator roles to save higher-ranked professors for responsable roles.

## 5. Known Behaviors & Edge Cases
-   The engine processes exams chronologically. This means an exam on Monday will be fully staffed before an exam on Tuesday is even considered.
-   If no suitable candidates can be found for a slot, it will be left empty, and the exam will be marked as having errors in the final summary. The engine will not crash.