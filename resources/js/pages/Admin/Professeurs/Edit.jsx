import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import ProfesseurForm from './ProfesseurForm';

export default function Edit({ professeurToEdit, services, modules, rangs, statuts, existingSpecialties = [] }) {
    const { translations } = useContext(TranslationContext);


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
                    key={professeurToEdit.id}
                    professeurToEdit={professeurToEdit}
                    services={services}
                    modules={modules}
                    rangs={rangs}
                    statuts={statuts}
                    existingSpecialties={existingSpecialties}
                    isEdit={true}
                />
            </div>
        </AppLayout>
    );
}
