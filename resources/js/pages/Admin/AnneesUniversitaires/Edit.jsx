import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import AnneeUniForm from './AnneeUniForm';

export default function Edit({ anneeUni }) {
    // Prop name matches controller
    const { translations } = useContext(TranslationContext);
    const { data, setData, put, processing, errors, reset } = useForm({
        annee: anneeUni?.annee || '',
    });

    useEffect(() => {
        if (anneeUni) {
            setData('annee', anneeUni.annee || '');
        } else {
            reset('annee');
        }
    }, [anneeUni]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.annees-universitaires.update', { anneeUni: anneeUni.id }), {
            // Use anneeUni.id
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: translations?.annee_uni_breadcrumb || 'Academic Years', href: route('admin.annees-universitaires.index') },
        { title: translations?.edit_annee_uni_breadcrumb || 'Edit' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_annee_uni_page_title || 'Edit Academic Year'} />

            <div className="mx-auto mt-6 max-w-xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {(translations?.edit_annee_uni_heading || 'Edit Academic Year: {year}').replace('{year}', anneeUni.annee)}
                </h1>
                <AnneeUniForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={handleSubmit} isEdit={true} />
            </div>
        </AppLayout>
    );
}
