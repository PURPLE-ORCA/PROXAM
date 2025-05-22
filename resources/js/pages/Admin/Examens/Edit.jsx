import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import ExamenForm from './ExamenForm';

const formatDatetimeForInput = (datetimeString) => {
    if (!datetimeString) return '';
    try {
        const date = new Date(datetimeString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    } catch (e) {
        return ''; 
    }
};

export default function Edit({ examenToEdit, quadrimestres, modules, salles, types, filieres, quadrimestres, allLevels, allModules, salles, types }) {
    const { translations } = useContext(TranslationContext);

    const { data, setData, put, processing, errors, reset } = useForm({
        nom: examenToEdit?.nom || '',
        quadrimestre_id: examenToEdit?.quadrimestre_id || '',
        module_id: examenToEdit?.module_id || '',
        type: examenToEdit?.type || '',
        filiere: examenToEdit?.filiere || '',
        debut: formatDatetimeForInput(examenToEdit?.debut),
        fin: formatDatetimeForInput(examenToEdit?.fin),
        required_professors: examenToEdit?.required_professors || 1,
        salles_pivot:
            examenToEdit?.salles?.map((s) => ({
                salle_id: s.id.toString(),
                capacite: s.pivot.capacite.toString(),
            })) || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.examens.update', { examen: examenToEdit.id }), {
            preserveScroll: true,
            // onSuccess: () => { /* Potentially reset parts of form or do nothing */ }
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
                    modules={modules}
                    salles={salles}
                    types={types}
                    filieres={filieres}
                    isEdit={true}
                    examenToEdit={examenToEdit} // Pass to pre-fill salles_pivot correctly in form
                />
            </div>
        </AppLayout>
    );
}
