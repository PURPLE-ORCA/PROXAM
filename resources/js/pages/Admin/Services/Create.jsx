import { TranslationContext } from '@/context/TranslationProvider';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import ServiceForm from './ServiceForm';
import AppLayout from '@/layouts/app-layout';

export default function Create() {
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        nom: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.services.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const breadcrumbs = [
        { title: translations?.services_breadcrumb || 'Services', href: route('admin.services.index') },
        { title: translations?.create_service_breadcrumb || 'Créer' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_service_page_title || 'Créer un Service'} />

            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {translations?.create_service_heading || 'Nouveau Service'}
                </h1>
                <ServiceForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={handleSubmit} />
            </div>
        </AppLayout>
    );
}
