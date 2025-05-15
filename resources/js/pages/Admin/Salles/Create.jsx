import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import SalleForm from './SalleForm';

export default function Create() {
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        nom: '',
        default_capacite: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.salles.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const breadcrumbs = [
        { title: translations?.salles_breadcrumb || 'Salles', href: route('admin.salles.index') },
        { title: translations?.create_salle_breadcrumb || 'Créer' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_salle_page_title || 'Créer une Salle'} />

            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">{translations?.create_salle_heading || 'Nouvelle Salle'}</h1>
                <SalleForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={handleSubmit} />
            </div>
        </AppLayout>
    );
}
