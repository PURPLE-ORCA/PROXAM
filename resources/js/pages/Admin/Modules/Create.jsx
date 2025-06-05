import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import ModuleForm from './ModuleForm';

export default function Create({ filieres, allLevels, selectedLevelId: initialLevelId, allDistinctModuleNames }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        nom: '',
        level_id: initialLevelId?.toString() || '', // Pre-fill if coming from a Level's page
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.modules.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('nom'); // Keep level_id if it was pre-selected
                if (!initialLevelId) reset('level_id');
            },
        });
    };

    const parentLevelForBreadcrumb = initialLevelId ? allLevels.find((l) => l.id === parseInt(initialLevelId, 10)) : null;
    const parentFiliereForBreadcrumb = parentLevelForBreadcrumb?.filiere; // Assuming level object has filiere eager loaded

    const breadcrumbs = [
        { title: translations?.filieres_breadcrumb || 'Study Fields', href: route('admin.filieres.index') },
        ...(parentFiliereForBreadcrumb
            ? [{ title: parentFiliereForBreadcrumb.nom, href: route('admin.levels.index', { filiere: parentFiliereForBreadcrumb.id }) }]
            : []),
        ...(parentLevelForBreadcrumb
            ? [{ title: parentLevelForBreadcrumb.nom, href: route('admin.modules.index', { level: parentLevelForBreadcrumb.id }) }]
            : []),
        { title: translations?.create_module_breadcrumb || 'Create Module' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_module_page_title || 'Create Module'} />
            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {translations?.create_module_heading || 'New Module'}
                    {parentLevelForBreadcrumb && (
                        <span className="block text-sm font-normal text-[var(--muted-foreground)]">
                            For {parentLevelForBreadcrumb.nom} ({parentFiliereForBreadcrumb?.nom})
                        </span>
                    )}
                </h1>
                <ModuleForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    filieres={filieres}
                    allLevels={allLevels}
                    currentLevelIdForCancel={initialLevelId}
                    isEdit={false}
                    allDistinctModuleNames={allDistinctModuleNames}
                />
            </div>
        </AppLayout>
    );
}
