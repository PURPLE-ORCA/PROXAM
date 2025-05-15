import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import ExamenForm from './ExamenForm';

export default function Create({ quadrimestres, modules, salles, types, filieres }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        nom: '',
        quadrimestre_id: '',
        module_id: '',
        type: '',
        filiere: '',
        debut: '',
        fin: '',
        required_professors: 1, // Default to at least 1
        salles_pivot: [], // Array of { salle_id, capacite }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.examens.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const breadcrumbs = [
        { title: translations?.examens_breadcrumb || 'Examinations', href: route('admin.examens.index') },
        { title: translations?.create_examen_breadcrumb || 'Create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_examen_page_title || 'Create Examination'} />
            <div className="mx-auto mt-6 max-w-3xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {translations?.create_examen_heading || 'New Examination'}
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
                    isEdit={false}
                />
            </div>
        </AppLayout>
    );
}
