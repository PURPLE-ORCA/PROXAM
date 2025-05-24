import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react'; // Removed useState as it's not directly used
import ExamenForm from './ExamenForm'; // Assuming ExamenForm is in the same directory

const formatDatetimeForInput = (datetimeString) => {
    if (!datetimeString) return '';
    try {
        const date = new Date(datetimeString);
        // Adjust for timezone offset to display correctly in local time input
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    } catch (e) {
        return '';
    }
};

export default function Edit({
    examenToEdit,
    quadrimestres, // From controller
    filieres, // From controller (will be passed as allFilieres to form)
    allLevels, // From controller
    allModules, // From controller
    salles, // From controller
    types, // From controller
}) {
    const { translations } = useContext(TranslationContext);

    const { data, setData, put, processing, errors } = useForm({
        // Removed reset as not explicitly used
        nom: examenToEdit?.nom || '',
        quadrimestre_id: examenToEdit?.quadrimestre_id?.toString() || '',
        module_id: examenToEdit?.module_id?.toString() || '',
        type: examenToEdit?.type || '',
        debut: formatDatetimeForInput(examenToEdit?.debut),
        // 'fin' is removed
        // 'required_professors' is removed (it's calculated)
        salles_pivot:
            examenToEdit?.salles?.map((s) => ({
                salle_id: s.id.toString(),
                capacite: s.pivot.capacite.toString(),
                professeurs_assignes_salle: s.pivot.professeurs_assignes_salle.toString(), // Added
            })) || [],
    });

    // This useEffect might be redundant if useForm's initial values are sufficient
    // and correctly handle examenToEdit changes, but can be kept for explicit re-sync.
    useEffect(() => {
        if (examenToEdit) {
            setData({
                nom: examenToEdit.nom || '',
                quadrimestre_id: examenToEdit.quadrimestre_id?.toString() || '',
                module_id: examenToEdit.module_id?.toString() || '',
                type: examenToEdit.type || '',
                debut: formatDatetimeForInput(examenToEdit.debut),
                salles_pivot: (examenToEdit.salles || []).map((s) => ({
                    salle_id: s.id.toString(),
                    capacite: s.pivot.capacite.toString(),
                    professeurs_assignes_salle: s.pivot.professeurs_assignes_salle.toString(),
                })),
            });
        }
    }, [examenToEdit, setData]); // setData should ideally not be in deps if function is stable

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.examens.update', { examen: examenToEdit.id }), {
            preserveScroll: true,
        });
    };

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
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    quadrimestres={quadrimestres}
                    salles={salles}
                    types={types}
                    allFilieres={filieres} // Pass 'filieres' prop as 'allFilieres'
                    allLevels={allLevels}
                    allModules={allModules}
                    isEdit={true}
                    examenToEdit={examenToEdit}
                />
            </div>
        </AppLayout>
    );
}
