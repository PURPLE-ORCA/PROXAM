# PROFS2EXAMS - Examination Management System

## 1. Project Brief

**PROXAM** is a comprehensive examination management system designed to automate and streamline the entire process of assigning professors to exams. It replaces a cumbersome, manual workflow with an intelligent, rule-based system to reduce administrative overhead, prevent scheduling conflicts, and manage all related academic data.

### Core Goals:
- **Efficient Professor Assignment:** Intelligently assign professors to exams based on availability, rank, workload quotas, and module qualifications.
- **Centralized Data Management:** Provide a single source of truth for all core academic entities: Professors, Users, Services, Rooms, and the complete Academic Calendar structure (Years, Sessions, Semesters).
- **Automated Conflict Resolution:** Proactively detect and flag scheduling conflicts caused by professor unavailabilities, and provide administrators with tools to resolve them instantly.
- **Modern, Intuitive UI:** Offer a clean, responsive, and powerful user interface built with a modern tech stack for a seamless administrative experience.

This application is built for a professional, government-level organization and is designed for stability, accuracy, and maintainability.

---

## 2. Tech Stack & Key Libraries

This project is built on a modern Laravel and React stack, designed for performance and developer productivity.

### Backend
- **Framework:** Laravel 12
- **Database:** PostgreSQL
- **Key Packages:**
  - `barryvdh/laravel-dompdf`: For generating PDF documents.
  - `maatwebsite/excel`: For the flexible, robust professor import feature.
  - `tighten/ziggy`: To use Laravel routes in JavaScript.

### Frontend
- **Framework:** React 19 (via Inertia.js)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 (CSS-first approach)
- **UI Components:**
  - `shadcn/ui`: The core component library for a consistent and accessible UI.
  - `Material React Table`: Used for complex, data-dense tables like the main Professors list.
  - `Headless UI`: Used for specific components like the Combobox in forms.
- **State Management:** Inertia.js `useForm` hook.
- **Icons:** Iconify

---

## 3. Getting Started: Local Development Setup

Follow these steps to get a local copy of the project up and running.

### Prerequisites
- PHP 8.2+
- Composer
- Node.js & npm (or yarn)
- A running PostgreSQL database instance

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-url]
    cd PROFS2EXAMS
    ```

2.  **Install PHP dependencies:**
    ```bash
    composer install
    ```

3.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```

4.  **Set up your environment file:**
    -   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    -   Open the `.env` file and configure your database connection variables (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).
    -   Configure your mail settings (e.g., set up Mailtrap credentials) to ensure password reset and notification emails work correctly.

5.  **Generate the application key:**
    ```bash
    php artisan key:generate
    ```

6.  **Run database migrations and seeders:**
    -   The seeder will populate your database with essential initial data.
    ```bash
    php artisan migrate --seed
    ```

7.  **Run the development servers:**
    -   You need to run two commands in two separate terminal windows.
    -   **Terminal 1 (Vite for frontend):**
        ```bash
        npm run dev
        ```
    -   **Terminal 2 (Laravel for backend):**
        ```bash
        php artisan serve
        ```

8.  **You're all set!** Visit the URL provided by `php artisan serve` (usually `http://127.0.0.1:8000`) in your browser.

---

## 4. Key Architectural Decisions

To understand the codebase, be aware of these core architectural choices:

-   **Stateless Service Objects:** Complex business logic (like the assignment engine) is encapsulated in stateless service classes. This was a deliberate choice to ensure predictability and make testing reliable, avoiding bugs related to shared state.
-   **Explicit Conflict Management:** Scheduling conflicts are not handled by "magic." They are explicitly flagged in the database via an `is_in_conflict` boolean on the `attributions` table, managed by a dedicated `UnavailabilityConflictService`.
-   **Flexible Data Importer:** The professor import system is designed to be robust. It reads Excel files by column *position*, not by headers, and contains a mapping layer to translate real-world data into system-required values.
-   **Contextual UI:** High-level controls (Year, Theme, User Menu) are deliberately placed on primary "hub" pages (`ControlCenter`) rather than in a persistent global header to provide context where it's most needed.