import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import FiliereForm from './FiliereForm';

export default function Edit({ filiereToEdit }) {
    // Prop name from controller
    const { translations } = useContext(TranslationContext);
    const { data, setData, put, processing, errors } = useForm({
        nom: filiereToEdit?.nom || '',
    });

    useEffect(() => {
        if (filiereToEdit) {
            setData('nom', filiereToEdit.nom || '');
        }
    }, [filiereToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.filieres.update', { filiere: filiereToEdit.id }), {
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: translations?.filieres_breadcrumb || 'Study Fields', href: route('admin.filieres.index') },
        { title: translations?.edit_filiere_breadcrumb || 'Edit' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_filiere_page_title || 'Edit Study Field'} />
            <div className="mx-auto mt-6 max-w-xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {(translations?.edit_filiere_heading || 'Edit Study Field: {name}').replace('{name}', filiereToEdit.nom)}
                </h1>
                <FiliereForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={handleSubmit} isEdit={true} />
            </div>
        </AppLayout>
    );
}
