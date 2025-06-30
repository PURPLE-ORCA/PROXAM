# Documentation: The Professor Import System

**Primary Owners:**
- `app/Imports/ProfesseursImport.php`
- `app/Http/Controllers/Admin/ProfesseurImportController.php`
- `resources/js/components/ImportModal.jsx`

## 1. Objective

The Professor Import system is designed to provide administrators with a fast, efficient way to bulk-create new professors and their associated user accounts from a single Excel or CSV file.

A key architectural decision was to make this system **flexible and resilient**. Instead of forcing the user to conform to a rigid template, the importer is designed to intelligently parse the client's existing, real-world spreadsheet format.

## 2. The Import Process

The import is handled by the `ProfesseursImport` class, which uses the `maatwebsite/excel` package. The workflow is as follows:

1.  **File Upload:** The admin uploads a file via the `ImportModal` component on the Professors page.
2.  **Controller Action:** The file is sent to the `ProfesseurImportController@store` method.
3.  **Parsing with `ToCollection`:** The controller instantiates `ProfesseursImport` and uses `Excel::import()`. Crucially, this importer uses the `ToCollection` concern, which loads all valid rows into a single collection. This gives us full manual control over the processing, which is necessary for handling complex relationships and validation.
4.  **Row-by-Row Processing:** The `collection()` method iterates through each row provided by the parser.

---

## 3. Core Logic & Data Transformation

For each row, the importer performs several key steps.

### 3.1. Reading by Column Position
The importer uses the `WithStartRow` concern (set to 2) to skip the header row. It **does not** read by column name. Instead, it reads by a hardcoded column index. This makes the system resilient to changes in header spelling, language, or casing.

The expected column order is:
-   `[0]` - P.P.R. (Ignored)
-   `[1]` - Nom (Last Name)
-   `[2]` - Prénom (First Name)
-   `[3]` - email
-   `[4]` - Cadre (Rank)
-   `[5]` - Spécialité Concours (Specialty)
-   `[6]` - Département (Service)
-   `[7]` - Date recrutement (Recruitment Date)

### 3.2. Manual Validation
Before any data is processed, each row is run through a manual Laravel `Validator` instance inside the `collection()` loop.
-   **Empty Row Handling:** The very first check is `empty(array_filter($row->toArray()))`. This immediately and gracefully skips any trailing empty rows found in the spreadsheet.
-   **Validation Rules:** Standard Laravel validation rules are applied to each column (e.g., `required`, `email`, `unique`, `exists`).
-   **Error Collection:** If a row fails validation, its row number and specific error message are added to a public `$errors` array on the import object. The import then **continues to the next row** instead of crashing. This ensures all valid rows are processed.

### 3.3. Data Transformation

-   **Rank Mapping (`mapRank()`):** The "Cadre" (Rank) column contains French-language strings (e.g., "Professeur Agrégé"). The `mapRank()` helper method is used to translate these human-readable strings into the system's required `enum` values (e.g., "PAG"). This method uses aggressive normalization (lowercase, stripping accents and special characters) to ensure a high match rate even with minor typos.
-   **Date Conversion:** The recruitment date is converted from Excel's integer/string format into a `DateTime` object suitable for the database.
-   **Service Lookup:** The "Département" (Service) name is used to look up the corresponding `Service` record's ID.

### 3.4. Database Transaction
The creation of the `User` and `Professeur` records for each valid row is wrapped in a `DB::transaction`. This ensures that if the `Professeur` creation fails for any reason, the associated `User` record is automatically rolled back, preventing orphaned user accounts in the database.

---

## 4. Error Handling

-   **Validation Errors:** If any rows fail the manual validation, the import is considered a partial success. The controller checks the `$import->getErrors()` array. If it's not empty, it redirects the user back with a detailed error message listing every row that failed and why.
-   **Fatal Errors:** If a critical error occurs during the database transaction (e.g., a lost database connection), the `try/catch` block in the controller will catch the `\Exception`, log it for debugging, and redirect the user with a generic "An unexpected error occurred" message.