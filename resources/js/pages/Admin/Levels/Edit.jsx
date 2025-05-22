import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import LevelForm from './LevelForm';

export default function Edit({ levelToEdit, filieres }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, put, processing, errors } = useForm({
        nom: levelToEdit?.nom || '',
        filiere_id: levelToEdit?.filiere_id?.toString() || '',
    });

    useEffect(() => {
        if (levelToEdit) {
            setData({
                nom: levelToEdit.nom || '',
                filiere_id: levelToEdit.filiere_id?.toString() || '',
            });
        }
    }, [levelToEdit, setData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.levels.update', { level: levelToEdit.id }), {
            preserveScroll: true,
        });
    };

    const parentFiliereForBreadcrumb = levelToEdit?.filiere;

    const breadcrumbs = [
        { title: translations?.filieres_breadcrumb || 'Study Fields', href: route('admin.filieres.index') },
        ...(parentFiliereForBreadcrumb
            ? [{ title: parentFiliereForBreadcrumb.nom, href: route('admin.levels.index', { filiere: parentFiliereForBreadcrumb.id }) }]
            : []),
        { title: translations?.edit_level_breadcrumb || 'Edit Level' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_level_page_title || 'Edit Level'} />
            <div className="mx-auto mt-6 max-w-xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {(translations?.edit_level_heading || 'Edit Level: {name}').replace('{name}', levelToEdit.nom)}
                    {parentFiliereForBreadcrumb && (
                        <span className="block text-sm font-normal text-[var(--muted-foreground)]">In {parentFiliereForBreadcrumb.nom}</span>
                    )}
                </h1>
                <LevelForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    filieres={filieres} // Pass all filieres for the dropdown (though it's disabled for edit)
                    currentFiliereId={levelToEdit?.filiere_id}
                    isEdit={true}
                />
            </div>
        </AppLayout>
    );
}
