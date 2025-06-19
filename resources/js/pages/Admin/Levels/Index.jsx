import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import LevelModal from './LevelModal'; 

export default function Index({ filiere, levels, filieresForForm }) {
    const { auth } = usePage().props; 
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // --- NEW STATE FOR MODALS ---
    const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);

    const breadcrumbs = useMemo(() => [
        { title: 'Study Fields', href: route('admin.filieres.index') },
        { title: filiere.nom }, 
    ], [filiere]);
    
    const openDeleteModal = (level) => { setItemToDelete(level); setIsDeleteModalOpen(true); };
    const openCreateModal = () => { setItemToEdit(null); setIsLevelModalOpen(true); };
    const openEditModal = (level) => { setItemToEdit(level); setIsLevelModalOpen(true); };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.levels.destroy', { level: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Levels for ${filiere.nom}`} />

            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Levels in {filiere.nom}</h1>
                    {(auth.abilities?.is_admin || auth.abilities?.is_rh) && (
                        <Button onClick={openCreateModal}>
                            <Icon icon="mdi:plus-circle-outline" className="mr-2 h-5 w-5" />
                            Add Level
                        </Button>
                    )}
                </div>

                {levels.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {levels.map((level) => (
                            <div key={level.id} className="group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ease-in-out -translate-y-2 transform border-blue-300 bg-gradient-to-br from-[var(--card)] to-blue-50/30 shadow-2xl dark:to-blue-900/30">
                                <Link href={route('admin.modules.index', { level: level.id })} className="block p-6 pb-4 transition-colors duration-200">
                                    <div className="absolute top-4 right-4 opacity-20 transition-opacity duration-300 group-hover:opacity-40">
                                        <Icon icon="mdi:stairs" className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                                    </div>
                                    <h3 className="mb-2 line-clamp-2 text-xl font-bold text-[var(--foreground)] transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                        {level.nom}
                                    </h3>
                                </Link>

                                <div className="px-6 pb-4">
                                    <div className="flex items-center justify-between border-t border-[var(--border)]/50 pt-4 dark:border-[var(--border)]/20">
                                        {(auth.abilities?.is_admin || auth.abilities?.is_rh) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-60 transition-opacity duration-200 group-hover:opacity-100 hover:bg-[var(--accent)] focus-visible:ring-0 focus-visible:ring-offset-0"><Icon icon="mdi:dots-horizontal" className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)] shadow-xl">
                                                    <DropdownMenuItem onClick={() => openEditModal(level)} className="cursor-pointer data-[highlighted]:bg-[var(--accent)]">
                                                        <Icon icon="mdi:pencil-outline" className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openDeleteModal(level)} className="cursor-pointer text-[var(--destructive)] data-[highlighted]:bg-[var(--destructive)] data-[highlighted]:text-[var(--destructive-foreground)]">
                                                        <Icon icon="mdi:delete-outline" className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--muted)]/20 dark:bg-[var(--muted)]/10">
                            <Icon icon="mdi:stairs-down" className="h-12 w-12 text-[var(--muted-foreground)]" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
                            No Levels Yet
                        </h3>
                        <p className="mx-auto mb-6 max-w-md text-[var(--muted-foreground)]">
                            No levels found for {filiere.nom}. Get started by adding one.
                        </p>
                        {(auth.abilities?.is_admin || auth.abilities?.is_rh) && (
                            <Button onClick={openCreateModal}>
                                <Icon icon="mdi:plus-circle-outline" className="mr-2 h-5 w-5" />
                                Add Level
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <LevelModal
                isOpen={isLevelModalOpen}
                onClose={() => setIsLevelModalOpen(false)}
                level={itemToEdit}
                filieres={filieresForForm}
                currentFiliereId={filiere.id}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Level"
                message={itemToDelete ? `Are you sure you want to delete "${itemToDelete.nom}"?` : ''}
            />
        </AppLayout>
    );
}
