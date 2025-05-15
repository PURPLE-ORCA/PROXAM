import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TranslationContext } from '@/context/TranslationProvider';
import { useContext } from 'react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { translations } = useContext(TranslationContext);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <h1>{translations.dashboard}</h1>
            {/* <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            </div> */}
        </AppLayout>
    );
}
