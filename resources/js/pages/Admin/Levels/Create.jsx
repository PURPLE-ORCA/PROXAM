import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react'; // usePage to get filiere_id from URL query
import { useContext, useEffect } from 'react';
import LevelForm from './LevelForm';

export default function Create({ filieres, selectedFiliereId: initialFiliereId }) {
    // selectedFiliereId from controller
    const { translations } = useContext(TranslationContext);

    const { data, setData, post, processing, errors, reset } = useForm({
        nom: '',
        filiere_id: initialFiliereId?.toString() || '', // Pre-fill if passed
    });

    // If initialFiliereId changes (e.g., due to navigation), update form
    useEffect(() => {
        if (initialFiliereId && data.filiere_id !== initialFiliereId.toString()) {
            setData('filiere_id', initialFiliereId.toString());
        }
    }, [initialFiliereId, setData, data.filiere_id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.levels.store'), {
            preserveScroll: true,
            onSuccess: () => {
                // Reset form, but keep filiere_id if it was pre-selected for adding another level to same filiere
                reset('nom');
                if (!initialFiliereId) reset('filiere_id');
            },
        });
    };

    const parentFiliereForBreadcrumb = initialFiliereId ? filieres.find((f) => f.id === parseInt(initialFiliereId, 10)) : null;

    const breadcrumbs = [
        { title: translations?.filieres_breadcrumb || 'Study Fields', href: route('admin.filieres.index') },
        ...(parentFiliereForBreadcrumb
            ? [{ title: parentFiliereForBreadcrumb.nom, href: route('admin.levels.index', { filiere: parentFiliereForBreadcrumb.id }) }]
            : []),
        { title: translations?.create_level_breadcrumb || 'Create Level' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_level_page_title || 'Create Level'} />
            <div className="mx-auto mt-6 max-w-xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {translations?.create_level_heading || 'New Level'}
                    {parentFiliereForBreadcrumb && (
                        <span className="block text-sm font-normal text-[var(--muted-foreground)]">For {parentFiliereForBreadcrumb.nom}</span>
                    )}
                </h1>
                <LevelForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    filieres={filieres}
                    currentFiliereId={initialFiliereId}
                    isEdit={false}
                />
            </div>
        </AppLayout>
    );
}
