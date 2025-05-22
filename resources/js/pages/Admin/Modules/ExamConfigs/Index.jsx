import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // For modal form
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, router, usePage } from '@inertiajs/react';
import { useContext, useMemo, useState } from 'react';
import ModuleExamRoomConfigForm from './ModuleExamRoomConfigForm';

export default function ManageModuleExamConfigs({ module: currentModule, currentConfigs, availableSalles }) {
    const { translations } = useContext(TranslationContext);
    const { auth, errors: pageErrors } = usePage().props; // Get form errors from page props if submission fails

    const [showFormModal, setShowFormModal] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null); // null for new, object for edit

    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const breadcrumbs = useMemo(
        () => [
            { title: translations?.filieres_breadcrumb || 'Study Fields', href: route('admin.filieres.index') },
            {
                title: currentModule.level?.filiere?.nom || 'Filiere',
                href: route('admin.levels.index', { filiere: currentModule.level?.filiere_id }),
            },
            { title: currentModule.level?.nom || 'Level', href: route('admin.modules.index', { level: currentModule.level_id }) },
            { title: currentModule.nom /* Not a link, or link to module edit? */ },
            { title: translations?.module_exam_configs_breadcrumb || 'Exam Room Configurations' },
        ],
        [translations, currentModule],
    );

    const openAddModal = () => {
        setEditingConfig(null);
        setShowFormModal(true);
    };
    const openEditModal = (config) => {
        setEditingConfig(config);
        setShowFormModal(true);
    };
    const closeFormModal = () => {
        setShowFormModal(false);
        setEditingConfig(null);
    };

    const openDeleteModal = (config) => {
        setItemToDelete(config);
        setIsDeleteModalOpen(true);
    };
    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.module-exam-configs.destroy', { config: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    const calculatedDefaultTotalProfs = useMemo(() => {
        return currentConfigs.reduce((sum, config) => sum + (parseInt(config.configured_prof_count, 10) || 0), 0);
    }, [currentConfigs]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${translations?.module_exam_configs_page_title || 'Exam Config for'} ${currentModule.nom}`} />

            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
                            {translations?.module_exam_configs_heading || 'Default Exam Room Configurations for:'} {currentModule.nom}
                        </h1>
                        <p className="text-sm text-[var(--muted-foreground)]">
                            {translations?.module_default_total_profs_label || 'Calculated Default Total Professors:'} {calculatedDefaultTotalProfs}
                        </p>
                    </div>
                    {(auth.abilities?.is_admin || auth.abilities?.is_rh) && (
                        <Button onClick={openAddModal}>
                            <Icon icon="mdi:plus-circle-outline" className="mr-2 h-5 w-5" />
                            {translations?.add_room_config_button || 'Add Room Configuration'}
                        </Button>
                    )}
                </div>

                <div className="rounded-lg bg-[var(--card)] shadow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{translations?.room_name_header || 'Room Name'}</TableHead>
                                <TableHead>{translations?.configured_capacity_header || 'Configured Capacity'}</TableHead>
                                <TableHead>{translations?.configured_prof_count_header || 'Default Profs for Room'}</TableHead>
                                <TableHead className="text-right">{translations?.actions_header || 'Actions'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentConfigs.length > 0 ? (
                                currentConfigs.map((config) => (
                                    <TableRow key={config.id}>
                                        <TableCell>
                                            {config.salle?.nom} (Def: {config.salle?.default_capacite})
                                        </TableCell>
                                        <TableCell>{config.configured_capacity}</TableCell>
                                        <TableCell>{config.configured_prof_count}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditModal(config)}
                                                className="mr-2 hover:bg-[var(--accent)]"
                                            >
                                                <Icon icon="mdi:pencil" className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDeleteModal(config)}
                                                className="text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                                            >
                                                <Icon icon="mdi:delete" className="h-5 w-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">
                                        {translations?.no_module_exam_configs_found || 'No default room configurations set for this module.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Modal for Add/Edit Form */}
            <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
                <DialogContent className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingConfig
                                ? translations?.edit_room_config_title || 'Edit Room Configuration'
                                : translations?.add_room_config_title || 'Add Room Configuration'}
                        </DialogTitle>
                    </DialogHeader>
                    <ModuleExamRoomConfigForm
                        module={currentModule}
                        availableSalles={availableSalles}
                        existingConfig={editingConfig}
                        onSubmitSuccess={closeFormModal}
                        onCancel={closeFormModal}
                    />
                </DialogContent>
            </Dialog>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={translations?.delete_module_exam_config_modal_title || 'Delete Room Configuration'}
                message={
                    itemToDelete
                        ? (
                              translations?.module_exam_config_delete_confirmation ||
                              "Are you sure you want to remove room {salleName} from this module's default exam configuration?"
                          ).replace('{salleName}', itemToDelete.salle?.nom)
                        : translations?.generic_delete_confirmation
                }
            />
        </AppLayout>
    );
}
