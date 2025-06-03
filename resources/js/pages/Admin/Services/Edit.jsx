import { TranslationContext } from '@/context/TranslationProvider';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import ServiceForm from './ServiceForm';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ service }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, put, processing, errors, reset } = useForm({
        nom: service?.nom || '',
    });

    useEffect(() => {
        if (service) {
            setData('nom', service.nom || '');
        } else {
            reset('nom');
        }
    }, [service]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.services.update', { service: service.id }), {
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: translations?.services_breadcrumb || 'Services', href: route('admin.services.index') },
        { title: translations?.edit_service_breadcrumb || 'Modifier' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_service_page_title || 'Modifier Service'} />

            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {(translations?.edit_service_heading || 'Modifier Service: {name}').replace('{name}', service.nom)}
                </h1>
                <ServiceForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={handleSubmit} isEdit={true} />
            </div>
        </AppLayout>
    );
}
