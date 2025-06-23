import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import ExamenForm from './ExamenForm';
import { Button } from '@/components/ui/button';

const formatDatetimeForInput = (datetimeString) => {
    if (!datetimeString) return '';
    try {
        const date = new Date(datetimeString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    } catch (e) { return ''; }
};

export default function Edit({
    examenToEdit,
    quadrimestres,
    filieres,
    allLevels,
    allModules,
    salles,
    types,
}) {
    const { data, setData, put, processing, errors } = useForm({
        nom: examenToEdit?.nom || '',
        quadrimestre_id: examenToEdit?.quadrimestre_id?.toString() || '',
        module_id: examenToEdit?.module_id?.toString() || '',
        type: examenToEdit?.type || '',
        debut: formatDatetimeForInput(examenToEdit?.debut),
        salles_pivot: (examenToEdit?.salles || []).map((s) => ({
            salle_id: s.id.toString(),
            capacite: s.pivot.capacite.toString(),
            professeurs_assignes_salle: s.pivot.professeurs_assignes_salle.toString(),
        })),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.examens.update', { examen: examenToEdit.id }), { preserveScroll: true });
    };

    const breadcrumbs = [
        { title: 'Examinations', href: route('admin.examens.index') },
        { title: 'Edit' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Examination" />
            <div className="mx-auto mt-6 max-w-3xl rounded-md border bg-card p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-card-foreground">
                    Edit Examination: {examenToEdit.nom || `ID ${examenToEdit.id}`}
                </h1>
                <ExamenForm
                    key={examenToEdit.id}
                    isEdit={true}
                    data={data}
                    setData={setData}
                    errors={errors}
                    quadrimestres={quadrimestres}
                    allFilieres={filieres}
                    allLevels={allLevels}
                    allModules={allModules}
                    salles={salles}
                    types={types}
                />
                 <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-border pt-6">
                    <Button variant="outline" type="button" asChild>
                        <Link href={route('admin.examens.index')}>Cancel</Link>
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={processing}>
                        {processing ? 'Saving...' : 'Update'}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
