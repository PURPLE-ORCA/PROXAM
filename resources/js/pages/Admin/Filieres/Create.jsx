import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import FiliereForm from './FiliereForm';

export default function Create() {
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        nom: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.filieres.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const breadcrumbs = [
        { title: translations?.filieres_breadcrumb || 'Study Fields', href: route('admin.filieres.index') },
        { title: translations?.create_filiere_breadcrumb || 'Create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_filiere_page_title || 'Create Study Field'} />
            <div className="mx-auto mt-6 max-w-xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {translations?.create_filiere_heading || 'New Study Field'}
                </h1>
                <FiliereForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={handleSubmit} isEdit={false} />
            </div>
        </AppLayout>
    );
}
