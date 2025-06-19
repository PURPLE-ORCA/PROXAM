import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import ExamenForm from './ExamenForm';
import { Button } from '@/components/ui/button';

export default function Create({ quadrimestres, filieres, allLevels, allModules, salles, types }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nom: '',
        quadrimestre_id: '',
        module_id: '',
        type: '',
        debut: '',
        salles_pivot: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.examens.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const breadcrumbs = [
        { title: 'Examinations', href: route('admin.examens.index') },
        { title: 'Create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Examination" />
            <div className="mx-auto mt-6 max-w-3xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    New Examination
                </h1>
                <ExamenForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    isEdit={false}
                    quadrimestres={quadrimestres}
                    allFilieres={filieres}
                    allLevels={allLevels}
                    allModules={allModules}
                    salles={salles}
                    types={types}
                />
                <div className="mt-8 flex items-center justify-end gap-x-4 border-t pt-6">
                    <Button variant="outline" type="button" asChild><Link href={route('admin.examens.index')}>Cancel</Link></Button>
                    <Button type="button" onClick={handleSubmit} disabled={processing}>Save</Button>
                </div>
            </div>
        </AppLayout>
    );
}
