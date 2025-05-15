import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import ModuleForm from './ModuleForm';

export default function Create() {
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        nom: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.modules.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const breadcrumbs = [
        { title: translations?.modules_breadcrumb || 'Modules', href: route('admin.modules.index') },
        { title: translations?.create_module_breadcrumb || 'Créer' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_module_page_title || 'Créer un Module'} />

            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {translations?.create_module_heading || 'Nouveau Module'}
                </h1>
                <ModuleForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={handleSubmit} />
            </div>
        </AppLayout>
    );
}
