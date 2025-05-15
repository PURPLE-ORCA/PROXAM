import { type LucideIcon } from 'lucide-react';
import type { Config as ZiggyConfig } from 'ziggy-js'; 

export interface Abilities {
    is_admin: boolean;
    is_rh: boolean;
    is_professeur: boolean;
    is_chef_service: boolean;
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
}

declare module '@inertiajs/react' {
    export interface Page<SharedProps = PageProps> {
        props: SharedProps;
    }
}
