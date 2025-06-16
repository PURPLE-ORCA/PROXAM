import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import SonnerToastProvider from '@/components/SonnerToastProvider';
import { TranslationContext } from '@/context/TranslationProvider'; // Import your context
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, useContext, useEffect } from 'react'; // Added useContext, useEffect

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { language } = useContext(TranslationContext); // Get current language

    // Set dir attribute on <html> element for global RTL/LTR styling
    useEffect(() => {
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.classList.toggle('rtl', language === 'ar');
        document.documentElement.classList.toggle('ltr', language !== 'ar');

    }, [language]);

    return (
        <AppShell variant="sidebar">
            <SonnerToastProvider>
                {/* <AppSidebar /> */}
                <AppContent variant="sidebar">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </SonnerToastProvider>
        </AppShell>
    );
}
