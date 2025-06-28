# Documentation: Conflict Detection & Resolution

**Primary Owners:**
- `app/Services/UnavailabilityConflictService.php`
- `app/Console/Commands/ResolveStaleConflicts.php`
- `app/Http/Controllers/AttributionController.php` (for the manual resolution UI)

## 1. Objective

This system is designed to proactively manage scheduling conflicts that arise when a professor becomes unavailable for a previously scheduled exam. It has two main components: an **Immediate Conflict Detection** mechanism and an automated **Stale Conflict Cleanup** process.

The goal is to ensure the administrative dashboard always presents an accurate, real-time view of staffing problems without requiring manual checks.

## 2. The `is_in_conflict` Flag

The entire system is built around a single boolean column on the `attributions` table: `is_in_conflict`.

-   `is_in_conflict = true`: This assignment is currently broken. The assigned professor is unavailable, and the slot is effectively unstaffed. This assignment needs immediate administrative attention.
-   `is_in_conflict = false`: This assignment is valid and staffed.

The UI relies entirely on this flag to highlight problematic rows and update the "Assignments in Conflict" dashboard widget.

---

## 3. Workflow 1: Immediate Conflict Detection

This workflow fires the moment an `Unavailability` is created or updated. It is handled by the `UnavailabilityConflictService`.

1.  **Trigger:** An admin or RH user creates or updates an `Unavailability` record for a professor through the UI.
2.  **Controller Action:** The `UnavailabilityController`'s `store()` or `update()` method is called.
3.  **Service Call:** After successfully saving the unavailability, the controller immediately calls `UnavailabilityConflictService->updateConflictsFor($unavailability)`.
4.  **Conflict Check:** The service method performs the following logic:
    -   It gets all of the professor's current and future assignments.
    -   It loops through each assignment and checks if the exam's time period overlaps with the new unavailability's time period.
    -   It builds a list of all `attribution.id`s that are now in conflict.
5.  **Database Update:**
    -   The service performs a database update to set `is_in_conflict = true` for all newly identified conflicting attributions.
    -   Crucially, it also **clears the flag** (`is_in_conflict = false`) for any assignments that were *previously* in conflict but are no longer affected by the updated unavailability.

This ensures the conflict status is always perfectly in sync with the latest unavailability data.

## 4. Workflow 2: Manual Conflict Resolution

This is the "One-Click Fix" feature that allows an admin to actively resolve a flagged conflict.

1.  **Alert:** The admin sees a non-zero count in the "Assignments in Conflict" dashboard widget and clicks it.
2.  **Filtered View:** They are taken to the Assignments page, which is pre-filtered to show only rows where `is_in_conflict = true`.
3.  **Action:** The admin clicks the "Resolve" button on a conflicting row.
4.  **Find Replacements:** A `GET` request is sent to the `attributions.find_replacements` endpoint. The `AttributionController@findReplacements` method runs a complex query to find a short list of qualified and available professors for that specific slot.
5.  **Re-assign:** The admin selects a new professor from the modal and confirms. A `PUT` request is sent to the `attributions.reassign` endpoint.
6.  **State Update:** The `AttributionController@reassign` method updates the `attribution` record with the `new_professeur_id` and, most importantly, **sets `is_in_conflict = false`**.

---

## 5. Workflow 3: Automated Stale Conflict Cleanup (The "Janitor")

This workflow solves the "Lazy Admin" problem, where a conflict is never manually resolved and simply becomes irrelevant due to the passage of time.

1.  **Trigger:** The Laravel Task Scheduler runs automatically every night at 1:00 AM.
2.  **Command Execution:** The scheduler executes the `app:resolve-stale-conflicts` Artisan command.
3.  **Logic:** The `ResolveStaleConflicts` command's `handle()` method performs the following:
    -   It fetches **all** attributions in the entire database where `is_in_conflict = true`.
    -   It loops through each one.
    -   For each conflicting attribution, it re-evaluates the professor's current unavailabilities against the exam's date.
    -   If it finds **no currently overlapping unavailability**, it determines the conflict is "stale" (i.e., the unavailability period has passed).
    -   It then updates that attribution, setting `is_in_conflict = false`.
4.  **Result:** The system is self-healing. The admin dashboard remains accurate without any manual intervention required to clean up old, irrelevant warnings.