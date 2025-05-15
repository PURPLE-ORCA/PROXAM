import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import SalleForm from './SalleForm';

export default function Edit({ salle: salleData }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, put, processing, errors, reset } = useForm({
        nom: salleData?.nom || '',
        default_capacite: salleData?.default_capacite || '',
    });

    useEffect(() => {
        if (salleData) {
            setData({
                nom: salleData.nom || '',
                default_capacite: salleData.default_capacite || '',
            });
        } else {
            reset();
        }
    }, [salleData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.salles.update', { salle: salleData.id }), {
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: translations?.salles_breadcrumb || 'Salles', href: route('admin.salles.index') },
        { title: translations?.edit_salle_breadcrumb || 'Modifier' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_salle_page_title || 'Modifier Salle'} />

            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {(translations?.edit_salle_heading || 'Modifier Salle: {name}').replace('{name}', salleData.nom)}
                </h1>
                <SalleForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={handleSubmit} isEdit={true} />
            </div>
        </AppLayout>
    );
}
