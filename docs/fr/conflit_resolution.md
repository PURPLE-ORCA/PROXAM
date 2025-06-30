# Documentation : Détection et Résolution des Conflits

**Propriétaires Principaux :**
- `app/Services/UnavailabilityConflictService.php`
- `app/Console/Commands/ResolveStaleConflicts.php`
- `app/Http/Controllers/AttributionController.php` (pour l'interface utilisateur de résolution manuelle)

## 1. Objectif

Ce système est conçu pour gérer de manière proactive les conflits de planification qui surviennent lorsqu'un professeur devient indisponible pour un examen précédemment programmé. Il comporte deux composants principaux : un mécanisme de **Détection Immédiate des Conflits** et un processus automatisé de **Nettoyage des Conflits Obsolètes**.

L'objectif est de garantir que le tableau de bord administratif présente toujours une vue précise et en temps réel des problèmes de personnel sans nécessiter de vérifications manuelles.

## 2. Le Drapeau `is_in_conflict`

L'ensemble du système est construit autour d'une seule colonne booléenne sur la table `attributions` : `is_in_conflict`.

-   `is_in_conflict = true` : Cette affectation est actuellement rompue. Le professeur affecté est indisponible, et le créneau est effectivement non pourvu. Cette affectation nécessite une attention administrative immédiate.
-   `is_in_conflict = false` : Cette affectation est valide et pourvue.

L'interface utilisateur s'appuie entièrement sur ce drapeau pour mettre en évidence les lignes problématiques et mettre à jour le widget du tableau de bord "Affectations en Conflit".

---

## 3. Flux de Travail 1 : Détection Immédiate des Conflits

Ce flux de travail se déclenche au moment où une `Unavailability` est créée ou mise à jour. Il est géré par le `UnavailabilityConflictService`.

1.  **Déclencheur :** Un administrateur ou un utilisateur RH crée ou met à jour un enregistrement `Unavailability` pour un professeur via l'interface utilisateur.
2.  **Action du Contrôleur :** La méthode `store()` ou `update()` du `UnavailabilityController` est appelée.
3.  **Appel de Service :** Après avoir enregistré avec succès l'indisponibilité, le contrôleur appelle immédiatement `UnavailabilityConflictService->updateConflictsFor($unavailability)`.
4.  **Vérification des Conflits :** La méthode de service exécute la logique suivante :
    -   Elle récupère toutes les affectations actuelles et futures du professeur.
    -   Elle parcourt chaque affectation et vérifie si la période de l'examen chevauche la période de la nouvelle indisponibilité.
    -   Elle construit une liste de tous les `attribution.id` qui sont maintenant en conflit.
5.  **Mise à Jour de la Base de Données :**
    -   Le service effectue une mise à jour de la base de données pour définir `is_in_conflict = true` pour toutes les attributions conflictuelles nouvellement identifiées.
    -   De manière cruciale, il **efface également le drapeau** (`is_in_conflict = false`) pour toutes les affectations qui étaient *précédemment* en conflit mais qui ne sont plus affectées par l'indisponibilité mise à jour.

**Note sur la Décision Architecturale :** Cette logique a été intentionnellement placée dans une classe de service appelée directement depuis le contrôleur, plutôt que dans un Eloquent Observer. Le développement précoce a révélé que les observateurs pouvaient échouer silencieusement et étaient difficiles à déboguer, tandis que cet appel de service direct est explicite, fiable et plus facile à tester.

## 4. Flux de Travail 2 : Résolution Manuelle des Conflits

C'est la fonctionnalité "Correction en un Clic" qui permet à un administrateur de résoudre activement un conflit signalé.

1.  **Alerte :** L'administrateur voit un nombre non nul dans le widget du tableau de bord "Affectations en Conflit" et clique dessus.
2.  **Vue Filtrée :** Il est dirigé vers la page des Affectations, pré-filtrée pour afficher uniquement les lignes où `is_in_conflict = true`.
3.  **Action :** L'administrateur clique sur le bouton "Résoudre" sur une ligne en conflit.
4.  **Recherche de Remplacements :** Une requête `GET` est envoyée au point de terminaison `attributions.find_replacements`. La méthode `AttributionController@findReplacements` exécute une requête complexe pour trouver une courte liste de professeurs qualifiés et disponibles pour ce créneau spécifique.
5.  **Réaffectation :** L'administrateur sélectionne un nouveau professeur dans la modale et confirme. Une requête `PUT` est envoyée au point de terminaison `attributions.reassign`.
6.  **Mise à Jour de l'État :** La méthode `AttributionController@reassign` met à jour l'enregistrement `attribution` avec le `new_professeur_id` et, surtout, **définit `is_in_conflict = false`**.

---

## 5. Flux de Travail 3 : Nettoyage Automatisé des Conflits Obsolètes (Le "Concierge")

Ce flux de travail résout le problème de l'"Administrateur Paresseux", où un conflit n'est jamais résolu manuellement et devient simplement non pertinent en raison du passage du temps.

1.  **Déclencheur :** Le planificateur de tâches Laravel s'exécute automatiquement chaque nuit à 1h00 du matin (configuré dans `routes/console.php`).
2.  **Exécution de la Commande :** Le planificateur exécute la commande Artisan `app:resolve-stale-conflicts`.
3.  **Logique :** La méthode `handle()` de la commande `ResolveStaleConflicts` effectue ce qui suit :
    -   Elle récupère **toutes** les attributions dans l'ensemble de la base de données où `is_in_conflict = true`.
    -   Elle parcourt chacune d'elles.
    -   Pour chaque attribution en conflit, elle réévalue les indisponibilités actuelles du professeur par rapport à la date de l'examen.
    -   Si elle ne trouve **aucune indisponibilité actuellement chevauchante**, elle détermine que le conflit est "obsolète" (c'est-à-dire que la période d'indisponibilité est passée).
    -   Elle met ensuite à jour cette attribution, en définissant `is_in_conflict = false`.
4.  **Résultat :** Le système s'auto-répare. Le tableau de bord administratif reste précis sans aucune intervention manuelle requise pour nettoyer les anciennes alertes non pertinentes.
