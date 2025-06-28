# Documentation: UI Philosophy & Patterns

## 1. Objective

This document outlines the core principles and recurring patterns used in the frontend of the PROFS2EXAMS application. Its purpose is to ensure that future development maintains a consistent, predictable, and high-quality user experience. Adhering to these patterns will accelerate development and reduce UI-related bugs.

## 2. Core Principles

-   **Consistency is King:** The application uses a single component library (`shadcn/ui`) for all core UI elements (buttons, modals, inputs, etc.). This ensures a cohesive look and feel across the entire platform.
-   **Performance First:** All data-heavy lists and tables rely on the Laravel backend for server-side pagination, sorting, and filtering. This prevents the frontend from becoming bogged down with large datasets and ensures the UI remains fast and responsive.
-   **Clarity over Cuteness:** The UI prioritizes clear, unambiguous information display. While aesthetically clean, the design avoids unnecessary animations or complex layouts that could confuse the user or obscure important information.
-   **Component Reusability:** Common UI elements (e.g., data tables, simple toolbars, modals) are built as generic, reusable components to enforce consistency and speed up the development of new features.

---

## 3. Key UI/UX Patterns

These are the established patterns that should be followed when building new features.

### 3.1. The Control Center Hub

-   **Concept:** For users with administrative roles (Admin, RH, Chef de Service), the primary landing page is the **Control Center**.
-   **Purpose:** It acts as a central navigation hub, providing access to all management modules.
-   **Context Bar:** The Control Center features a dedicated "Context Bar" at the top. This bar houses session-level controls like the Academic Year switcher, user menu, and theme toggle. This declutters the global header and places context-setting actions where the user's workflow begins.

### 3.2. Modal vs. Full Page Forms

A clear distinction is made to optimize the user experience for data entry.

-   **Modals are for Simple CRUD:** For straightforward Create/Update operations (e.g., Services, Rooms, Users), forms are presented inside a **Modal (`Dialog`)**. This provides a quick, in-context editing experience without a full page refresh. The standard pattern is `IndexPage -> Modal -> Form`.
-   **Full Pages are for Complex Forms:** For complex data models with many fields and relationships (e.g., Professors, Exams), forms are given their own dedicated pages (e.g., `/professeurs/create`). This avoids a cramped and confusing modal experience and allows for more complex UI elements and layouts.

### 3.3. The Hybrid Table Strategy

The application uses two different table components, chosen based on the complexity of the data being displayed.

-   **`MaterialReactTable` (MRT):** Used for data-dense pages with complex filtering needs, such as the main **Professors list**. MRT provides powerful built-in features for multi-column filtering, column resizing, and more, which are essential for this type of view.
-   **Custom `DataTable`:** Used for most other CRUD pages (e.g., Users, Assignments). This is a lightweight, custom-built table using `shadcn/ui` components. It's designed for clarity and performance, with features like server-side pagination and sorting, and is paired with dedicated toolbars for filtering.

### 3.4. Visually Grouped Tables

For pages like **Assignments**, where data is naturally hierarchical (multiple professors per exam), a "fused row" design is used.
-   **Pattern:** The parent record (the Exam) is displayed once. All child records (the assigned Professors) are listed below it without repeating the parent data. A top border visually separates each group.
-   **Implementation:** This is achieved through custom rendering logic in the React component that checks the `examen_id` of the previous row to determine if it should render the exam details. The backend controller ensures the data is pre-sorted by exam to make this possible.