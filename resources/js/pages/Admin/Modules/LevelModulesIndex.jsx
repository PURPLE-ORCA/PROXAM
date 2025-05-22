import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useContext, useMemo, useState } from 'react';

export default function LevelModulesIndex({ level, modules, filiere, filters }) {
    // Receives parent level, its modules, and parent filiere
    const { translations } = useContext(TranslationContext);
    const { auth } = usePage().props;
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);

    const breadcrumbs = useMemo(
        () => [
            { title: translations?.filieres_breadcrumb || 'Study Fields', href: route('admin.filieres.index') },
            { title: filiere.nom, href: route('admin.levels.index', { filiere: filiere.id }) },
            { title: level.nom }, // Current level name
        ],
        [translations, filiere, level],
    );

    const openDeleteModal = (moduleItem) => {
        setItemToDelete(moduleItem);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.modules.destroy', { module: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
                onError: () => setIsDeleteModalOpen(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${translations?.modules_page_title_for_level || 'Modules for'} ${level.nom} (${filiere.nom})`} />

            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-[var(--foreground)]">
                        {translations?.modules_heading_for_level || 'Modules in'} {level.nom}
                        <span className="block text-sm font-normal text-[var(--muted-foreground)]">{filiere.nom}</span>
                    </h1>
                    {(auth.abilities?.is_admin || auth.abilities?.is_rh) && (
                        <Button asChild className="shadow-lg transition-all duration-200 hover:shadow-xl">
                            <Link href={route('admin.modules.create', { level: level.id })}>
                                <Icon icon="mdi:plus-circle-outline" className="mr-2 h-5 w-5" />
                                {translations?.add_module_button || 'Add Module'}
                            </Link>
                        </Button>
                    )}
                </div>

                {modules.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {modules.map(
                            (
                                moduleItem, // Renamed map variable to moduleItem
                            ) => (
                                <div
                                    key={moduleItem.id}
                                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ease-in-out ${
                                        hoveredCard === moduleItem.id
                                            ? '-translate-y-2 transform border-blue-300 bg-gradient-to-br from-[var(--card)] to-blue-50/30 shadow-2xl dark:to-blue-900/30'
                                            : 'border-[var(--border)] bg-[var(--card)] shadow-md hover:shadow-lg'
                                    }`}
                                    onMouseEnter={() => setHoveredCard(moduleItem.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <Link
                                        // TODO: Define where a module card links to.
                                        // For now, it could link to the module's edit page, or a future detail page.
                                        // Or to the "Module Exam Config" page we planned (Point 7).
                                        // Let's make it link to the "Module Exam Config" page (to be created).
                                        href={route('admin.modules.exam-configs.index', { module: moduleItem.id })} // Placeholder route
                                        className="block p-6 pb-4 transition-colors duration-200"
                                    >
                                        <div className="absolute top-4 right-4 opacity-20 transition-opacity duration-300 group-hover:opacity-40">
                                            <Icon icon="mdi:book-open-page-variant-outline" className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <h3 className="mb-2 line-clamp-2 text-xl font-bold text-[var(--foreground)] transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                            {moduleItem.nom}
                                        </h3>
                                        {/* Placeholder for potential future info like exam count for this module */}
                                        {/* <p className="text-sm text-[var(--muted-foreground)]">{moduleItem.examens_count || 0} Exams</p> */}
                                    </Link>

                                    <div className="px-6 pb-4">
                                        <div className="flex items-center justify-between border-t border-[var(--border)]/50 pt-4 dark:border-[var(--border)]/20">
                                            <div className="flex items-center text-xs text-[var(--muted-foreground)]">
                                                {/* Display other relevant info if available */}
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
                                                                href={route('admin.modules.edit', { module: moduleItem.id })}
                                                                className="cursor-pointer data-[highlighted]:bg-[var(--accent)]"
                                                            >
                                                                <Icon icon="mdi:pencil-outline" className="mr-2 h-4 w-4" />
                                                                {translations?.edit_button_title || 'Edit'}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => openDeleteModal(moduleItem)}
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
                            ),
                        )}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--muted)]/20 dark:bg-[var(--muted)]/10">
                            <Icon icon="mdi:book-open-variant-outline" className="h-12 w-12 text-[var(--muted-foreground)]" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
                            {translations?.no_modules_found_heading || 'No Modules Yet'}
                        </h3>
                        <p className="mx-auto mb-6 max-w-md text-[var(--muted-foreground)]">
                            {(
                                translations?.no_modules_found_for_level ||
                                'No modules found for {levelName} in {filiereName}. Get started by adding one.'
                            )
                                .replace('{levelName}', level.nom)
                                .replace('{filiereName}', filiere.nom)}
                        </p>
                        {(auth.abilities?.is_admin || auth.abilities?.is_rh) && (
                            <Button asChild>
                                <Link href={route('admin.modules.create', { level: level.id })}>
                                    <Icon icon="mdi:plus-circle-outline" className="mr-2 h-5 w-5" />
                                    {translations?.add_module_button || 'Add Module'}
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
                title={translations?.delete_module_modal_title || 'Delete Module'}
                message={
                    itemToDelete
                        ? (
                              translations?.module_delete_confirmation ||
                              'Are you sure you want to delete the module "{name}"? This may also affect associated exams.'
                          ).replace('{name}', itemToDelete.nom)
                        : translations?.generic_delete_confirmation
                }
                confirmText={translations?.delete_button_title || 'Delete'}
            />
        </AppLayout>
    );
}
