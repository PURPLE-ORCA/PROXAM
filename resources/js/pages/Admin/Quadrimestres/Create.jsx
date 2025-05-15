import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import QuadrimestreForm from './QuadrimestreForm';

export default function Create({ sesons }) {
    // Receives sesons from controller
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        seson_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.quadrimestres.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const breadcrumbs = [
        { title: translations?.quadrimestres_breadcrumb || 'Semesters', href: route('admin.quadrimestres.index') },
        { title: translations?.create_quadrimestre_breadcrumb || 'Create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_quadrimestre_page_title || 'Create Semester'} />

            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {translations?.create_quadrimestre_heading || 'New Semester'}
                </h1>
                <QuadrimestreForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={handleSubmit} sesons={sesons} />
            </div>
        </AppLayout>
    );
}
