// resources/js/lib/navigation.ts

export interface ControlCenterItem {
    titleKey: string; // The translation key, e.g., 'dashboard_nav_item'
    fallbackTitle: string; // The English fallback text
    descriptionKey: string; // Translation key for the description
    fallbackDescription: string; // Fallback description
    icon: string; // Iconify icon name (e.g., 'mdi:view-dashboard')
    route: string; // The route name from web.php
    roles: ('admin' | 'professeur' | 'rh' | 'chef_service')[]; // Array of roles that can see this
}

export const controlCenterItems: ControlCenterItem[] = [
    // --- DASHBOARDS ---
    {
        titleKey: 'dashboard_nav_item',
        fallbackTitle: 'Admin Dashboard',
        descriptionKey: 'dashboard_desc',
        fallbackDescription: 'View key metrics, assignments, and system overview.',
        icon: 'mdi:view-dashboard-outline',
        route: 'admin.dashboard',
        roles: ['admin'],
    },
    {
        titleKey: 'professor_dashboard_nav_item',
        fallbackTitle: 'My Dashboard',
        descriptionKey: 'professor_dashboard_desc',
        fallbackDescription: 'See your upcoming schedule, exchanges, and notifications.',
        icon: 'mdi:account-school-outline',
        route: 'professeur.dashboard',
        roles: ['professeur'],
    },
    {
        titleKey: 'rh_dashboard_page_title',
        fallbackTitle: 'RH Dashboard',
        descriptionKey: 'rh_dashboard_desc',
        fallbackDescription: 'Manage professor unavailabilities and view HR metrics.',
        icon: 'mdi:account-tie-outline',
        route: 'rh.dashboard',
        roles: ['rh'],
    },

    // --- ADMIN ---
    {
        titleKey: 'services_nav_item',
        fallbackTitle: 'Services',
        descriptionKey: 'services_desc',
        fallbackDescription: 'Manage academic departments and services.',
        icon: 'mdi:sitemap-outline',
        route: 'admin.services.index',
        roles: ['admin'],
    },
    {
        titleKey: 'salles_nav_item',
        fallbackTitle: 'Rooms',
        descriptionKey: 'salles_desc',
        fallbackDescription: 'Manage examination rooms and their capacities.',
        icon: 'mdi:door-open',
        route: 'admin.salles.index',
        roles: ['admin'],
    },
    {
        titleKey: 'annee_uni_nav_item',
        fallbackTitle: 'Academic Years',
        descriptionKey: 'annee_uni_desc',
        fallbackDescription: 'Define and manage academic years.',
        icon: 'mdi:calendar-month-outline',
        route: 'admin.annees-universitaires.index',
        roles: ['admin'],
    },
    {
        titleKey: 'sesons_nav_item',
        fallbackTitle: 'Sessions',
        descriptionKey: 'sesons_desc',
        fallbackDescription: 'Manage exam sessions within an academic year.',
        icon: 'mdi:clipboard-text-multiple-outline',
        route: 'admin.sesons.index',
        roles: ['admin'],
    },
    {
        titleKey: 'quadrimestres_nav_item',
        fallbackTitle: 'Semesters',
        descriptionKey: 'quadrimestres_desc',
        fallbackDescription: 'Manage semesters or quarters within sessions.',
        icon: 'mdi:calendar-range-outline',
        route: 'admin.quadrimestres.index',
        roles: ['admin'],
    },
    {
        titleKey: 'users_nav_item',
        fallbackTitle: 'Users',
        descriptionKey: 'users_desc',
        fallbackDescription: 'Manage user accounts and system roles.',
        icon: 'mdi:account-group-outline',
        route: 'admin.users.index',
        roles: ['admin'],
    },
    {
        titleKey: 'professeurs_nav_item',
        fallbackTitle: 'Professors',
        descriptionKey: 'professeurs_desc',
        fallbackDescription: 'Manage professor profiles, accounts, and modules.',
        icon: 'mdi:account-school-outline',
        route: 'admin.professeurs.index',
        roles: ['admin'],
    },
    {
        titleKey: 'examens_nav_item',
        fallbackTitle: 'Examinations',
        descriptionKey: 'examens_desc',
        fallbackDescription: 'Create, edit, and manage all examinations.',
        icon: 'mdi:file-document-edit-outline',
        route: 'admin.examens.index',
        roles: ['admin'],
    },
    {
        titleKey: 'attributions_nav_item',
        fallbackTitle: 'Assignments',
        descriptionKey: 'attributions_desc',
        fallbackDescription: 'View all professor-to-exam assignments.',
        icon: 'mdi:clipboard-check-multiple-outline',
        route: 'admin.attributions.index',
        roles: ['admin'],
    },
    {
        titleKey: 'filieres_nav_item',
        fallbackTitle: 'Study Fields',
        descriptionKey: 'filieres_desc',
        fallbackDescription: 'Manage study fields, levels, and modules.',
        icon: 'mdi:graph-outline',
        route: 'admin.filieres.index',
        roles: ['admin'],
    },

    // --- ADMIN & RH ---
    {
        titleKey: 'unavailabilities_nav_item',
        fallbackTitle: 'Prof. Unavailabilities',
        descriptionKey: 'unavailabilities_desc',
        fallbackDescription: 'Set and manage professor unavailability periods.',
        icon: 'mdi:calendar-edit',
        route: 'admin.unavailabilities.index',
        roles: ['admin', 'rh'],
    },
    
    // --- PROFESSOR ---
    {
        titleKey: 'my_schedule_nav_item',
        fallbackTitle: 'My Schedule',
        descriptionKey: 'my_schedule_desc',
        fallbackDescription: 'View your personal exam assignment calendar.',
        icon: 'mdi:calendar-outline',
        route: 'professeur.schedule.index',
        roles: ['professeur'],
    },
    {
        titleKey: 'my_unavailabilities_nav_item',
        fallbackTitle: 'My Unavailabilities',
        descriptionKey: 'my_unavailabilities_desc',
        fallbackDescription: 'View your recorded unavailability periods.',
        icon: 'mdi:calendar-account-outline',
        route: 'professeur.unavailabilities.index',
        roles: ['professeur'],
    },
    {
        titleKey: 'exchanges_nav_item',
        fallbackTitle: 'Exchanges',
        descriptionKey: 'exchanges_desc',
        fallbackDescription: 'Propose and manage exam duty swaps.',
        icon: 'mdi:swap-horizontal-bold',
        route: 'professeur.exchanges.index',
        roles: ['professeur'],
    },

    // --- CHEF DE SERVICE ---
    {
        titleKey: 'chef_service_professor_schedules_nav_item',
        fallbackTitle: 'View Professor Schedules',
        descriptionKey: 'chef_service_schedules_desc',
        fallbackDescription: "View schedules for professors in your service.",
        icon: 'mdi:account-supervisor-outline',
        route: 'chef_service.professor_schedules.index',
        roles: ['chef_service'],
    },
];
