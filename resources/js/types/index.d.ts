import { type LucideIcon } from 'lucide-react';
import type { Config as ZiggyConfig } from 'ziggy-js'; 

export interface AnneeUniType {
    id: number;
    annee: string;
    annee_debut: string; // Changed to string
    annee_fin: string;   // Changed to string
    date_debut: string; // Added for direct access if needed
    date_fin: string;   // Added for direct access if needed
}

export interface AcademicYearSharedData {
    current: AnneeUniType | null;
    all: AnneeUniType[];
    selected_id: number | null;
    selected_annee: string | null;
    annee_debut: string | null; // Changed to string
    annee_fin: string | null;   // Changed to string
    date_debut: string | null; // Added for direct access if needed
    date_fin: string | null;   // Added for direct access if needed
}

// New Model Interfaces
export interface Professeur {
    id: number;
    nom: string;
    prenom: string;
    statut: string; // e.g., 'Active', 'Inactive'
    // Add other properties as needed
}

export interface Module {
    id: number;
    nom: string;
    // Add other properties as needed
}

export interface Salle {
    id: number;
    nom: string;
    // Add other properties as needed
}

export interface Examen {
    id: number;
    nom?: string; // Optional
    debut: string; // Date string
    fin: string;   // Date string
    module_id: number;
    seson_id: number;
    quadrimestre_id: number;
    type: string;
    filiere_id: number;
    total_required_professors: number;
    module: Module; // Relation
    salles: Salle[]; // Relation
    attributions_count?: number; // From withCount
    // Add other properties as needed
}

export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    link?: string; // Optional, for clickable notifications
    read_at: string | null;
    created_at: string;
    updated_at: string;
    severity?: 'info' | 'success' | 'warning' | 'error'; // Optional, for styling
    // Add other properties as needed
}

export interface Abilities {
    is_admin: boolean;
    is_rh: boolean;
    is_professeur: boolean;
    is_chef_service: boolean;
    is_admin_or_rh: boolean; 
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string; 
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role?: string;
    [key: string]: unknown;
}

export interface Auth {
    user: User | null; 
    abilities: Abilities;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
    active?: boolean;
}

export interface PageProps {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: ZiggyConfig & { location: string };
    flash: {
        success?: string;
        error?: string;
    };
    sidebarOpen: boolean;
    errors?: Record<string, string>;
    [key: string]: unknown;
    academicYear: AcademicYearSharedData; 
}

declare module '@inertiajs/react' {
    export interface Page<SharedProps = PageProps> {
        props: SharedProps;
    }
}
