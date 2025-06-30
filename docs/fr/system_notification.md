# Documentation : Le Système de Notification

**Propriétaires Principaux :**
- `app/Http/Controllers/NotificationController.php` 
- `resources/js/components/NotificationBadge.jsx` 

## 1. Objectif

Le Système de Notification est conçu pour fournir aux utilisateurs un retour d'information en temps réel (ou quasi-temps réel) sur les processus et événements importants en arrière-plan au sein de l'application. Son implémentation la plus visible est l'icône de cloche de notification dans l'en-tête principal de l'application.

Le système est basé sur un **mécanisme de sondage (polling)**, qui a été choisi pour sa simplicité et sa fiabilité par rapport à des solutions plus complexes comme les WebSockets.

## 2. Le Mécanisme de Sondage

L'ensemble du système est piloté par le composant frontend `NotificationBadge.jsx`.

1.  **Montage du Composant :** Lorsque le composant `NotificationBadge` se charge pour la première fois, il effectue immédiatement deux appels API pour récupérer l'état initial.
2.  **Boucle `setInterval` :** Un `setInterval` JavaScript est initié, qui récupère les données de notification toutes les **3 secondes** (3000ms). Cela maintient le compte du badge et la liste déroulante à jour.
3.  **Démontage du Composant :** Lorsque l'utilisateur navigue ailleurs ou que le composant est détruit, la fonction `clearInterval` est appelée pour arrêter le sondage et prévenir les fuites de mémoire.

Cette stratégie de sondage garantit que l'interface utilisateur est mise à jour régulièrement avec un minimum de surcharge serveur et sans nécessiter un rechargement complet de la page.

---

## 3. Composants et Points d'Accès Principaux

### 3.1. Le Frontend (`NotificationBadge.jsx`)

-   **Gestion de l'État :** Le composant gère trois éléments clés de l'état local :
    -   `pendingCount` : Le nombre de notifications non lues, affiché dans le badge rouge.
    -   `latestNotifications` : Un tableau des objets de notification les plus récents à afficher dans la liste déroulante.
    -   `isDropdownOpen` : Un booléen pour contrôler la visibilité du menu déroulant.
-   **Actions Utilisateur :**
    -   **Cliquer sur une seule notification :** Déclenche `markAsRead(notification.id)`, qui envoie une requête `POST` au point d'accès `notifications.markRead` avec l'ID spécifique. Il navigue ensuite l'utilisateur vers le lien de la notification.
    -   **Cliquer sur "Marquer tout comme lu" :** Déclenche `markAsRead()` (avec un ID nul), qui envoie une requête `POST` au même point d'accès pour marquer toutes les notifications de l'utilisateur comme lues.
-   **Retour d'Information :** Le composant utilise la bibliothèque `sonner` pour afficher des toasts de succès ou d'erreur après une action "marquer comme lu".

### 3.2. Le Backend (`NotificationController.php`)

Le système s'appuie sur trois points d'accès API dédiés :

1.  **`GET /notifications/pending-count`** (`notifications.pendingCount`)
    -   **Action :** Récupéré toutes les 3 secondes par le frontend.
    -   **Logique :** Effectue une requête de base de données simple et rapide pour `COUNT(*)` où `user_id` correspond à l'utilisateur authentifié et `read_at` est `null`.
    -   **Retourne :** Une réponse JSON, par exemple, `{ "count": 5 }`.

2.  **`GET /notifications/latest`** (`notifications.latest`)
    -   **Action :** Également récupéré toutes les 3 secondes.
    -   **Logique :** Récupère les 5 à 10 notifications non lues les plus récentes pour l'utilisateur.
    -   **Retourne :** Une réponse JSON contenant un tableau d'objets de notification.

3.  **`POST /notifications/mark-read/{notification?}`** (`notifications.markRead`)
    -   **Action :** Appelé lorsqu'un utilisateur interagit avec la liste déroulante.
    -   **Logique :**
        -   Si un ID de `notification` est fourni, il met à jour cet enregistrement unique, en définissant sa colonne `read_at` à l'horodatage actuel.
        -   Si aucun ID n'est fourni, il met à jour **toutes** les notifications non lues de l'utilisateur.
