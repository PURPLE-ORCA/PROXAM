import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import UnavailabilityForm from './UnavailabilityForm';

export default function Create({ professeurs }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        professeur_id: '',
        start_datetime: '',
        end_datetime: '',
        reason: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.unavailabilities.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const breadcrumbs = [
        { title: translations?.unavailabilities_breadcrumb || 'Prof. Unavailabilities', href: route('admin.unavailabilities.index') },
        { title: translations?.create_unavailability_breadcrumb || 'Create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_unavailability_page_title || 'Add Unavailability'} />
            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {translations?.create_unavailability_heading || 'New Unavailability Period'}
                </h1>
                <UnavailabilityForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    professeurs={professeurs}
                    isEdit={false}
                />
            </div>
        </AppLayout>
    );
}
