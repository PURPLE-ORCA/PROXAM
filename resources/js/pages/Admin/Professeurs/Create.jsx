
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import ProfesseurForm from './ProfesseurForm';

export default function Create({ services, modules, rangs, statuts }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        professeur_nom: '',
        professeur_prenom: '',
        email: '',
        rang: '',
        statut: '',
        is_chef_service: false,
        date_recrutement: '',
        specialite: '',
        service_id: '',
        module_ids: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.professeurs.store'), {
            preserveScroll: true,
            onSuccess: () => reset(), 
        });
    };

    const breadcrumbs = [
        { title: translations?.professeurs_breadcrumb || 'Professors', href: route('admin.professeurs.index') },
        { title: translations?.create_professeur_breadcrumb || 'Create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_professeur_page_title || 'Create Professor'} />
            <div className="mx-auto mt-6 max-w-4xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {translations?.create_professeur_heading || 'New Professor'}
                </h1>
                <ProfesseurForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    services={services}
                    modules={modules}
                    rangs={rangs}
                    statuts={statuts}
                    isEdit={false}
                />
            </div>
        </AppLayout>
    );
}
