import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useContext, useMemo, useState } from 'react';

export default function Index({ filiere, levels }) {
    const { translations } = useContext(TranslationContext);
    const { auth } = usePage().props; 
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);

    const breadcrumbs = useMemo(
        () => [
            { title: translations?.filieres_breadcrumb || 'Study Fields', href: route('admin.filieres.index') },
            { title: filiere.nom }, 
        ],
        [translations, filiere],
    );

    const openDeleteModal = (level) => {
        setItemToDelete(level);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.levels.destroy', { level: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
                onError: () => setIsDeleteModalOpen(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${translations?.levels_page_title || 'Levels for'} ${filiere.nom}`} />

            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-[var(--foreground)]">
                        {translations?.levels_heading || 'Levels in'} {filiere.nom}
                    </h1>
                    {(auth.abilities?.is_admin || auth.abilities?.is_rh) && (
                        <Button asChild className="shadow-lg transition-all duration-200 hover:shadow-xl">
                            <Link href={route('admin.levels.create', { filiere_id: filiere.id })}>
                                <Icon icon="mdi:plus-circle-outline" className="mr-2 h-5 w-5" />
                                {translations?.add_level_button || 'Add Level'}
                            </Link>
                        </Button>
                    )}
                </div>

                {levels.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {levels.map((level) => (
                            <div
                                key={level.id}
                                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ease-in-out ${
                                    hoveredCard === level.id
                                        ? '-translate-y-2 transform border-blue-300 bg-gradient-to-br from-[var(--card)] to-blue-50/30 shadow-2xl dark:to-blue-900/30'
                                        : 'border-[var(--border)] bg-[var(--card)] shadow-md hover:shadow-lg'
                                }`}
                                onMouseEnter={() => setHoveredCard(level.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <Link
                                    href={route('admin.modules.index', { level: level.id })} 
                                    className="block p-6 pb-4 transition-colors duration-200"
                                >
                                    <div className="absolute top-4 right-4 opacity-20 transition-opacity duration-300 group-hover:opacity-40">
                                        <Icon icon="mdi:stairs" className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                                    </div>
                                    <h3 className="mb-2 line-clamp-2 text-xl font-bold text-[var(--foreground)] transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                        {level.nom}
                                    </h3>
                                </Link>

                                <div className="px-6 pb-4">
                                    <div className="flex items-center justify-between border-t border-[var(--border)]/50 pt-4 dark:border-[var(--border)]/20">
                                        <div className="flex items-center text-xs text-[var(--muted-foreground)]">
                                            {/* <Icon icon="mdi:book-open-variant" className="mr-1 h-3 w-3" />
                                            <span>{level.modules_count || 0} Modules</span> */}
                                        </div>

                                        {(auth.abilities?.is_admin || auth.abilities?.is_rh) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 opacity-60 transition-opacity duration-200 group-hover:opacity-100 hover:bg-[var(--accent)] focus-visible:ring-0 focus-visible:ring-offset-0"
                                                    >
                                                        <Icon icon="mdi:dots-horizontal" className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)] shadow-xl"
                                                >
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={route('admin.levels.edit', { level: level.id })}
                                                            className="cursor-pointer data-[highlighted]:bg-[var(--accent)]"
                                                        >
                                                            <Icon icon="mdi:pencil-outline" className="mr-2 h-4 w-4" />
                                                            {translations?.edit_button_title || 'Edit'}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => openDeleteModal(level)}
                                                        className="cursor-pointer text-[var(--destructive)] data-[highlighted]:bg-[var(--destructive)] data-[highlighted]:text-[var(--destructive-foreground)]"
                                                    >
                                                        <Icon icon="mdi:delete-outline" className="mr-2 h-4 w-4" />
                                                        {translations?.delete_button_title || 'Delete'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-20 dark:from-blue-400/10 dark:to-purple-400/10" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--muted)]/20 dark:bg-[var(--muted)]/10">
                            <Icon icon="mdi:stairs-down" className="h-12 w-12 text-[var(--muted-foreground)]" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
                            {translations?.no_levels_found_heading || 'No Levels Yet'}
                        </h3>
                        <p className="mx-auto mb-6 max-w-md text-[var(--muted-foreground)]">
                            {(translations?.no_levels_found_for_filiere || 'No levels found for {filiereName}. Get started by adding one.').replace(
                                '{filiereName}',
                                filiere.nom,
                            )}
                        </p>
                        {(auth.abilities?.is_admin || auth.abilities?.is_rh) && (
                            <Button asChild>
                                <Link href={route('admin.levels.create', { filiere_id: filiere.id })}>
                                    <Icon icon="mdi:plus-circle-outline" className="mr-2 h-5 w-5" />
                                    {translations?.add_level_button || 'Add Level'}
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={translations?.delete_level_modal_title || 'Delete Level'}
                message={
                    itemToDelete
                        ? (
                              translations?.level_delete_confirmation ||
                              'Are you sure you want to delete the level "{name}"? This may also delete associated modules and exams.'
                          ).replace('{name}', itemToDelete.nom)
                        : translations?.generic_delete_confirmation
                }
                confirmText={translations?.delete_button_title || 'Delete'}
            />
        </AppLayout>
    );
}
