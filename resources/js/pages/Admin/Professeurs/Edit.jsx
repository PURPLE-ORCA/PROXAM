import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import ProfesseurForm from './ProfesseurForm';

export default function Edit({ professeurToEdit, services, modules, rangs, statuts, existingSpecialties = [] }) {
    const { translations } = useContext(TranslationContext);

    // Initialize the form with empty values first - the component will handle initialization
    const { data, setData, put, processing, errors } = useForm({
        professeur_nom: '',
        professeur_prenom: '',
        email: '',
        rang: '',
        statut: '',
        is_chef_service: false,
        date_recrutement: '',
        specialite: '',
        service_id: '',
        module_ids: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Updating with data:', data); // Debug log
        put(route('admin.professeurs.update', professeurToEdit.id), {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Professor updated successfully');
            },
            onError: (errors) => {
                console.log('Update errors:', errors);
            },
        });
    };

    const breadcrumbs = [
        { title: translations?.professeurs_breadcrumb || 'Professors', href: route('admin.professeurs.index') },
        { title: translations?.edit_professeur_breadcrumb || 'Edit' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_professeur_page_title || 'Edit Professor'} />
            <div className="mx-auto mt-6 max-w-4xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {translations?.edit_professeur_heading || 'Edit Professor'}: {professeurToEdit.prenom} {professeurToEdit.nom}
                </h1>
                <ProfesseurForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    services={services}
                    modules={modules}
                    rangs={rangs}
                    statuts={statuts}
                    existingSpecialties={existingSpecialties}
                    isEdit={true}
                    professeurToEdit={professeurToEdit}
                />
            </div>
        </AppLayout>
    );
}
