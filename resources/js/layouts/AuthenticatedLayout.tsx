import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
// import { AppSidebar } from '@/components/app-sidebar'; // We don't need this anymore
import { AppHeader } from '@/components/app-header'; // We'll need a proper header now
import SonnerToastProvider from '@/components/SonnerToastProvider';
import { TranslationContext } from '@/context/TranslationProvider';
import { type BreadcrumbItem, type PageProps, type User } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren, useContext, useEffect } from 'react';

export default function AuthenticatedLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { language } = useContext(TranslationContext);
    const { auth } = usePage<PageProps>().props;

    useEffect(() => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.classList.toggle('rtl', language === 'ar');
        document.documentElement.classList.toggle('ltr', language !== 'ar');
    }, [language]);

    return (
        // The AppShell variant might need to change from 'sidebar' to a default or 'header' variant
        <AppShell> 
            <SonnerToastProvider>
                {/* We'll need a dedicated AppHeader component to house notifications, user menu, etc. */}
                {/* For now, let's assume AppSidebarHeader can be repurposed or we build a new AppHeader */}
                {/* <AppSidebarHeader breadcrumbs={breadcrumbs} /> */}

                {/* The content no longer needs the 'sidebar' variant */}
                <AppContent>
                    {children}
                </AppContent>
            </SonnerToastProvider>
        </AppShell>
    );
}
