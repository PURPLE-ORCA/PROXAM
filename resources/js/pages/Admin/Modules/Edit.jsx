import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import ModuleForm from './ModuleForm';

export default function Edit({ moduleToEdit, filieres, allLevels, allDistinctModuleNames }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, put, processing, errors } = useForm({
        nom: moduleToEdit?.nom || '',
        level_id: moduleToEdit?.level_id?.toString() || '',
    });

    useEffect(() => {
        if (moduleToEdit) {
            setData({
                nom: moduleToEdit.nom || '',
                level_id: moduleToEdit.level_id?.toString() || '',
            });
        }
    }, [moduleToEdit, setData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.modules.update', { module: moduleToEdit.id }), {
            preserveScroll: true,
        });
    };

    const parentLevelForBreadcrumb = moduleToEdit?.level;
    const parentFiliereForBreadcrumb = parentLevelForBreadcrumb?.filiere;

    const breadcrumbs = [
        { title: translations?.filieres_breadcrumb || 'Study Fields', href: route('admin.filieres.index') },
        ...(parentFiliereForBreadcrumb
            ? [{ title: parentFiliereForBreadcrumb.nom, href: route('admin.levels.index', { filiere: parentFiliereForBreadcrumb.id }) }]
            : []),
        ...(parentLevelForBreadcrumb
            ? [{ title: parentLevelForBreadcrumb.nom, href: route('admin.modules.index', { level: parentLevelForBreadcrumb.id }) }]
            : []),
        { title: translations?.edit_module_breadcrumb || 'Edit Module' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_module_page_title || 'Edit Module'} />
            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {(translations?.edit_module_heading || 'Edit Module: {name}').replace('{name}', moduleToEdit.nom)}
                    {parentLevelForBreadcrumb && (
                        <span className="block text-sm font-normal text-[var(--muted-foreground)]">
                            In {parentLevelForBreadcrumb.nom} ({parentFiliereForBreadcrumb?.nom})
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
                    currentLevelIdForCancel={moduleToEdit?.level_id}
                    isEdit={true}
                    allDistinctModuleNames={allDistinctModuleNames}
                />
            </div>
        </AppLayout>
    );
}
