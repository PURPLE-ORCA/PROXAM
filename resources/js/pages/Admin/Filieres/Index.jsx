import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, router } from '@inertiajs/react';
import { useContext, useMemo, useState } from 'react';

export default function Index({ filieres }) {
    const { translations } = useContext(TranslationContext);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);

    const breadcrumbs = useMemo(
        () => [{ title: translations?.filieres_breadcrumb || 'Study Fields', href: route('admin.filieres.index') }],
        [translations],
    );

    const openDeleteModal = (filiere) => {
        setItemToDelete(filiere);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.filieres.destroy', { filiere: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.filieres_page_title || 'Study Fields'} />

            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-[var(--foreground)]">{translations?.filieres_heading || 'Study Field'}</h1>
                    <Button asChild className="shadow-lg transition-all duration-200 hover:shadow-xl">
                        <Link href={route('admin.filieres.create')}>
                            <Icon icon="mdi:plus-circle-outline" className="mr-2 h-5 w-5" />
                            {translations?.add_filiere_button || 'Add Study Field'}
                        </Link>
                    </Button>
                </div>

                {filieres.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filieres.map((filiere) => (
                            <div
                                key={filiere.id}
                                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ease-in-out ${
                                    hoveredCard === filiere.id
                                        ? '-translate-y-2 transform border-blue-300 bg-gradient-to-br from-[var(--card)] to-blue-50/30 shadow-2xl'
                                        : 'border-[var(--border)] bg-[var(--card)] shadow-md hover:shadow-lg'
                                }`}
                                onMouseEnter={() => setHoveredCard(filiere.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                <Link
                                    href={route('admin.levels.index', { filiere: filiere.id })}
                                    className="block p-6 pb-4 transition-colors duration-200"
                                >
                                    {/* Card Header with Icon */}
                                    <div className="absolute top-4 right-4 opacity-20 transition-opacity duration-300 group-hover:opacity-40">
                                        <Icon icon="mdi:school-outline" className="h-8 w-8 text-blue-500" />
                                    </div>

                                    {/* Main Content Area */}

                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="mb-2 line-clamp-2 text-xl font-bold text-[var(--foreground)] transition-colors duration-200 group-hover:text-blue-600">
                                                {filiere.nom}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>

                                {/* Action Bar */}
                                <div className="px-6 pb-4">
                                    <div className="flex items-center justify-between border-t border-[var(--border)]/50 pt-4">
                                        <div className="flex items-center text-xs text-[var(--muted-foreground)]">
                                            <Icon icon="mdi:clock-outline" className="mr-1 h-3 w-3" />
                                            <span>Recently updated</span>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 opacity-60 transition-opacity duration-200 group-hover:opacity-100 hover:bg-[var(--accent)]"
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
                                                        href={route('admin.filieres.edit', { filiere: filiere.id })}
                                                        className="cursor-pointer hover:bg-[var(--accent)]"
                                                    >
                                                        <Icon icon="mdi:pencil-outline" className="mr-2 h-4 w-4" />
                                                        {translations?.edit_button_title || 'Edit'}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openDeleteModal(filiere)} className="cursor-pointer">
                                                    <Icon icon="mdi:delete-outline" className="mr-2 h-4 w-4" />
                                                    {translations?.delete_button_title || 'Delete'}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Hover Overlay Effect */}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--muted)]/20">
                            <Icon icon="mdi:school-outline" className="h-12 w-12 text-[var(--muted-foreground)]" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-[var(--foreground)]">No Study Fields Found</h3>
                        <p className="mx-auto mb-6 max-w-md text-[var(--muted-foreground)]">
                            {translations?.no_filieres_found || 'Get started by creating your first study field to organize academic programs.'}
                        </p>
                        <Button asChild>
                            <Link href={route('admin.filieres.create')}>
                                <Icon icon="mdi:plus-circle-outline" className="mr-2 h-5 w-5" />
                                {translations?.add_filiere_button || 'Add Study Field'}
                            </Link>
                        </Button>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={translations?.delete_filiere_modal_title || 'Delete Study Field'}
                message={
                    itemToDelete
                        ? (
                              translations?.filiere_delete_confirmation ||
                              'Are you sure you want to delete the study field "{name}"? This may also delete associated levels and modules.'
                          ).replace('{name}', itemToDelete.nom)
                        : translations?.generic_delete_confirmation
                }
            />
        </AppLayout>
    );
}
