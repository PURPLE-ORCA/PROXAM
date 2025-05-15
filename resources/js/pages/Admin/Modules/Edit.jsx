import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import ModuleForm from './ModuleForm';

export default function Edit({ module: moduleData }) {
    // Renamed prop to moduleData to avoid conflict
    const { translations } = useContext(TranslationContext);
    const { data, setData, put, processing, errors, reset } = useForm({
        nom: moduleData?.nom || '',
    });

    useEffect(() => {
        if (moduleData) {
            setData('nom', moduleData.nom || '');
        } else {
            reset('nom');
        }
    }, [moduleData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.modules.update', { module: moduleData.id }), {
            // Use moduleData.id
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: translations?.modules_breadcrumb || 'Modules', href: route('admin.modules.index') },
        { title: translations?.edit_module_breadcrumb || 'Modifier' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_module_page_title || 'Modifier Module'} />

            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {(translations?.edit_module_heading || 'Modifier Module: {name}').replace('{name}', moduleData.nom)}
                </h1>
                <ModuleForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={handleSubmit} isEdit={true} />
            </div>
        </AppLayout>
    );
}
