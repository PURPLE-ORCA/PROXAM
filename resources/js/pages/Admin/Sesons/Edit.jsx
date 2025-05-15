import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import SesonForm from './SesonForm';

export default function Edit({ seson, anneesUniversitaires }) {
    // Receives seson and anneesUniversitaires
    const { translations } = useContext(TranslationContext);
    const { data, setData, put, processing, errors, reset } = useForm({
        code: seson?.code || '',
        annee_uni_id: seson?.annee_uni_id || '',
    });

    useEffect(() => {
        if (seson) {
            setData({
                code: seson.code || '',
                annee_uni_id: seson.annee_uni_id || '',
            });
        } else {
            reset();
        }
    }, [seson]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.sesons.update', { seson: seson.id }), {
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: translations?.sesons_breadcrumb || 'Sessions', href: route('admin.sesons.index') },
        { title: translations?.edit_seson_breadcrumb || 'Edit' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_seson_page_title || 'Edit Session'} />

            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {(translations?.edit_seson_heading || 'Edit Session: {code}').replace('{code}', seson.code)}
                </h1>
                <SesonForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    anneesUniversitaires={anneesUniversitaires}
                    isEdit={true}
                />
            </div>
        </AppLayout>
    );
}
