import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useContext } from 'react';
import ExamenForm from './ExamenForm'; // Assuming ExamenForm is in the same directory

export default function Edit({
    examenToEdit,
    quadrimestres,
    filieres,
    allLevels,
    allModules,
    salles,
    types,
}) {
    const { translations } = useContext(TranslationContext);

    const breadcrumbs = [
        { title: translations?.examens_breadcrumb || 'Examinations', href: route('admin.examens.index') },
        { title: translations?.edit_examen_breadcrumb || 'Edit' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_examen_page_title || 'Edit Examination'} />
            <div className="mx-auto mt-6 max-w-3xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {(translations?.edit_examen_heading || 'Edit Examination: {name}').replace('{name}', examenToEdit.nom || `ID ${examenToEdit.id}`)}
                </h1>
                <ExamenForm
                    key={examenToEdit.id} // <<<< CRITICAL: Add key prop
                    isEdit={true}
                    examenToEdit={examenToEdit}
                    quadrimestres={quadrimestres}
                    allFilieres={filieres}
                    allLevels={allLevels}
                    allModules={allModules}
                    salles={salles}
                    types={types}
                />
            </div>
        </AppLayout>
    );
}
