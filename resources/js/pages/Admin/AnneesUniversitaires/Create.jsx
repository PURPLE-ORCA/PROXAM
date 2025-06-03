import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import AnneeUniForm from './AnneeUniForm';

export default function Create() {
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        annee: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.annees-universitaires.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const breadcrumbs = [
        { title: translations?.annee_uni_breadcrumb || 'Academic Years', href: route('admin.annees-universitaires.index') },
        { title: translations?.create_annee_uni_breadcrumb || 'Create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_annee_uni_page_title || 'Create Academic Year'} />

            <div className="mx-auto mt-6 max-w-xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {translations?.create_annee_uni_heading || 'New Academic Year'}
                </h1>
                <AnneeUniForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={handleSubmit} />
            </div>
        </AppLayout>
    );
}
