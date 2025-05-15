import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import SesonForm from './SesonForm';

export default function Create({ anneesUniversitaires }) {
    // Receives anneesUniversitaires from controller
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        annee_uni_id: '', // Default to empty
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.sesons.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const breadcrumbs = [
        { title: translations?.sesons_breadcrumb || 'Sessions', href: route('admin.sesons.index') },
        { title: translations?.create_seson_breadcrumb || 'Create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_seson_page_title || 'Create Session'} />

            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">{translations?.create_seson_heading || 'New Session'}</h1>
                <SesonForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    anneesUniversitaires={anneesUniversitaires}
                />
            </div>
        </AppLayout>
    );
}
