import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import UnavailabilityForm from './UnavailabilityForm';

// Helper to format datetime-local input (YYYY-MM-DDTHH:mm)
const formatDatetimeForInput = (datetimeString) => {
    if (!datetimeString) return '';
    try {
        const date = new Date(datetimeString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
};

export default function Edit({ unavailabilityToEdit, professeurs, anneeUnis }) { // Add anneeUnis to props
    const { translations } = useContext(TranslationContext);
    const { data, setData, put, processing, errors, reset } = useForm({
        professeur_id: unavailabilityToEdit?.professeur_id || '',
        annee_uni_id: unavailabilityToEdit?.annee_uni_id || '', // Add annee_uni_id to form state
        start_datetime: formatDatetimeForInput(unavailabilityToEdit?.start_datetime),
        end_datetime: formatDatetimeForInput(unavailabilityToEdit?.end_datetime),
        reason: unavailabilityToEdit?.reason || '',
    });

    useEffect(() => {
        if (unavailabilityToEdit) {
            setData({
                professeur_id: unavailabilityToEdit.professeur_id || '',
                annee_uni_id: unavailabilityToEdit.annee_uni_id || '', // Set annee_uni_id in useEffect
                start_datetime: formatDatetimeForInput(unavailabilitiesToEdit.start_datetime),
                end_datetime: formatDatetimeForInput(unavailabilitiesToEdit.end_datetime),
                reason: unavailabilityToEdit.reason || '',
            });
        } else {
            reset();
        }
    }, [unavailabilityToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Note: We don't typically change professeur_id on edit for an existing record
        // The form has it disabled. If it were enabled, ensure data.professeur_id is correct.
        put(route('admin.unavailabilities.update', { unavailability: unavailabilityToEdit.id }), {
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: translations?.unavailabilities_breadcrumb || 'Prof. Unavailabilities', href: route('admin.unavailabilities.index') },
        { title: translations?.edit_unavailability_breadcrumb || 'Edit' },
    ];

    const professorName =
        unavailabilityToEdit?.professeur?.prenom && unavailabilityToEdit?.professeur?.nom
            ? `${unavailabilityToEdit.professeur.prenom} ${unavailabilityToEdit.professeur.nom}`
            : 'Professor';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_unavailability_page_title || 'Edit Unavailability'} />
            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {(translations?.edit_unavailability_heading || 'Edit Unavailability for {name}').replace('{name}', professorName)}
                </h1>
                <UnavailabilityForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    professeurs={professeurs}
                    anneeUnis={anneeUnis} // Pass anneeUnis to the form
                    isEdit={true}
                />
            </div>
        </AppLayout>
    );
}
