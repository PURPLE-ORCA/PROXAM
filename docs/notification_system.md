# Documentation: The Notification System

**Primary Owners:**
- `app/Http/Controllers/NotificationController.php` (Assumed location)
- `resources/js/components/NotificationBadge.jsx` (Or similar path)

## 1. Objective

The Notification System is designed to provide users with real-time (or near-real-time) feedback on important background processes and events within the application. Its most visible implementation is the notification bell icon in the main application header.

The system is built on a **polling mechanism**, which was chosen for its simplicity and reliability over more complex solutions like WebSockets.

## 2. The Polling Mechanism

The entire system is driven by the frontend `NotificationBadge.jsx` component.

1.  **Component Mount:** When the `NotificationBadge` component first loads, it immediately makes two API calls to fetch the initial state.
2.  **`setInterval` Loop:** A JavaScript `setInterval` is initiated, which re-fetches the notification data every **3 seconds** (3000ms). This keeps the badge count and the dropdown list fresh.
3.  **Component Unmount:** When the user navigates away or the component is destroyed, the `clearInterval` function is called to stop the polling and prevent memory leaks.

This polling strategy ensures the UI is updated regularly with minimal server overhead and without requiring a full page reload.

---

## 3. Core Components & Endpoints

### 3.1. The Frontend (`NotificationBadge.jsx`)

-   **State Management:** The component manages three key pieces of local state:
    -   `pendingCount`: The number of unread notifications, displayed in the red badge.
    -   `latestNotifications`: An array of the most recent notification objects to display in the dropdown.
    -   `isDropdownOpen`: A boolean to control the visibility of the dropdown menu.
-   **User Actions:**
    -   **Clicking a single notification:** Triggers `markAsRead(notification.id)`, which sends a `POST` request to the `notifications.markRead` endpoint with the specific ID. It then navigates the user to the notification's link.
    -   **Clicking "Mark All As Read":** Triggers `markAsRead()` (with a null ID), which sends a `POST` request to the same endpoint to mark all of the user's notifications as read.
-   **Feedback:** The component uses the `sonner` library to display success or error toasts after a "mark as read" action.

### 3.2. The Backend (`NotificationController.php`)

The system relies on three dedicated API endpoints:

1.  **`GET /notifications/pending-count`** (`notifications.pendingCount`)
    -   **Action:** Fetched every 3 seconds by the frontend.
    -   **Logic:** Performs a simple, fast database query to `COUNT(*)` where `user_id` matches the authenticated user and `read_at` is `null`.
    -   **Returns:** A JSON response, e.g., `{ "count": 5 }`.

2.  **`GET /notifications/latest`** (`notifications.latest`)
    -   **Action:** Also fetched every 3 seconds.
    -   **Logic:** Fetches the top 5-10 most recent unread notifications for the user.
    -   **Returns:** A JSON response containing an array of notification objects.

3.  **`POST /notifications/mark-read/{notification?}`** (`notifications.markRead`)
    -   **Action:** Called when a user interacts with the dropdown.
    -   **Logic:**
        -   If a `notification` ID is provided, it updates that single record, setting its `read_at` column to the current timestamp.
        -   If no ID is provided, it updates **all** of the user's unread notifications.

---

