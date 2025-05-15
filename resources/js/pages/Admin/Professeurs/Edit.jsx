import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import ProfesseurForm from './ProfesseurForm';

export default function Edit({ professeurToEdit, services, modules, rangs, statuts }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, put, processing, errors, reset } = useForm({
        professeur_nom: professeurToEdit?.nom || '',
        professeur_prenom: professeurToEdit?.prenom || '',
        email: professeurToEdit?.user?.email || '', // Email from the related user
        rang: professeurToEdit?.rang || '',
        statut: professeurToEdit?.statut || '',
        is_chef_service: professeurToEdit?.is_chef_service || false,
        date_recrutement: professeurToEdit?.date_recrutement || '',
        specialite: professeurToEdit?.specialite || '',
        service_id: professeurToEdit?.service_id || '',
        module_ids: professeurToEdit?.modules?.map((m) => m.id) || [], // Pre-populate selected modules
    });

    useEffect(() => {
        if (professeurToEdit) {
            setData({
                professeur_nom: professeurToEdit.nom || '',
                professeur_prenom: professeurToEdit.prenom || '',
                email: professeurToEdit.user?.email || '',
                rang: professeurToEdit.rang || '',
                statut: professeurToEdit.statut || '',
                is_chef_service: professeurToEdit.is_chef_service || false,
                date_recrutement: professeurToEdit.date_recrutement || '',
                specialite: professeurToEdit.specialite || '',
                service_id: professeurToEdit.service_id || '',
                module_ids: professeurToEdit.modules?.map((m) => m.id) || [],
            });
        } else {
            reset();
        }
    }, [professeurToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.professeurs.update', { professeur: professeurToEdit.id }), {
            preserveScroll: true,
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
                    {(translations?.edit_professeur_heading || 'Edit Professor: {name}').replace(
                        '{name}',
                        `${professeurToEdit.prenom} ${professeurToEdit.nom}`,
                    )}
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
                    isEdit={true}
                    professeurToEdit={professeurToEdit} // Pass for pre-selecting modules in form
                />
            </div>
        </AppLayout>
    );
}
