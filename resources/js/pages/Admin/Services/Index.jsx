import { Button } from '@/components/ui/button'; // Assuming Shadcn Button
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useContext, useEffect, useMemo, useState } from 'react';
import ConfirmationModal from '@/components/Common/ConfirmationModal'; 

const defaultPageSize = 15;
const defaultPageIndex = 0;

export default function Index({ services: servicesPagination, filters }) {
    const { translations } = useContext(TranslationContext);
    const { auth } = usePage().props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openDeleteModal = (service) => {
        setItemToDelete(service); // service should be an object like { id: 1, nom: 'Anatomie' }
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.services.destroy', { service: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => closeDeleteModal(), // Close modal on success
                onError: () => closeDeleteModal(), // Optionally close on error too, or handle differently
            });
        }
    };

    const breadcrumbs = useMemo(
        () => [{ title: translations?.services_breadcrumb || 'Services', href: route('admin.services.index') }],
        [translations],
    );

    const [pagination, setPagination] = useState({
        pageIndex: servicesPagination.current_page - 1 || defaultPageIndex,
        pageSize: servicesPagination.per_page || defaultPageSize,
    });

    useEffect(() => {
        if (pagination.pageIndex !== servicesPagination.current_page - 1 || pagination.pageSize !== servicesPagination.per_page) {
            router.get(
                route('admin.services.index'),
                {
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize,
                    search: filters?.search || '',
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }
    }, [pagination.pageIndex, pagination.pageSize, servicesPagination, filters?.search]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'nom',
                header: translations?.service_name_column_header || 'Nom du Service',
                size: 400,
            },
        ],
        [translations],
    );

    const handleDelete = (id, name) => {
        const confirmationMessage = (translations?.service_delete_confirmation || 'Êtes-vous sûr de vouloir supprimer le service "{name}" ?').replace(
            '{name}',
            name,
        );
        if (confirm(confirmationMessage)) {
            router.delete(route('admin.services.destroy', { service: id }), {
                preserveScroll: true,
            });
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: servicesPagination.data || [],
        manualPagination: true,
        state: { pagination },
        rowCount: servicesPagination.total,
        onPaginationChange: setPagination,
        enableEditing: auth.abilities?.is_admin,
        enableRowActions: auth.abilities?.is_admin,

        muiTablePaperProps: {
            elevation: 0,
            sx: {
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--background)', // Light mode: white background
                '.dark &': {
                    backgroundColor: 'var(--background)', // Dark mode: black background (assuming --background flips)
                },
            },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: 'var(--background)', // Light: white
                color: 'var(--foreground)', // Light: black
                fontWeight: '600',
                borderBottomWidth: '2px',
                borderColor: 'var(--border)', // Light: black border
                '& .MuiSvgIcon-root': {
                    color: 'var(--foreground)', // Light: black icon
                },
                '.dark &': {
                    // Dark mode specific overrides
                    backgroundColor: 'var(--background)', // Dark: black
                    color: 'var(--foreground)', // Dark: white
                    borderColor: 'var(--border)', // Dark: white border
                    '& .MuiSvgIcon-root': {
                        color: 'var(--foreground)', // Dark: white icon
                    },
                },
            },
        },
        muiTableBodyCellProps: {
            sx: {
                backgroundColor: 'var(--background)', // Ensures cell background matches paper in light mode
                color: 'var(--foreground)', // Light: black text
                borderBottom: '1px solid var(--border)', // Light: black border
                '.dark &': {
                    // Dark mode specific overrides
                    backgroundColor: 'var(--background)', // Dark: black background for cells
                    color: 'var(--foreground)', // Dark: white text
                    borderBottom: '1px solid var(--border)', // Dark: white border
                },
            },
        },
        muiTableBodyRowProps: {
            sx: {
                // Ensuring the row itself doesn't override cell backgrounds unless hovered
                backgroundColor: 'transparent', // Or var(--background) if cells need explicit parent bg
                '&:hover td': {
                    backgroundColor: 'var(--accent)', // Light: subtle hover
                    '.dark &': {
                        backgroundColor: 'var(--accent)', // Dark: subtle hover (ensure --accent is also dark-mode aware)
                    },
                },
            },
        },
        muiTopToolbarProps: {
            sx: {
                backgroundColor: 'var(--background)',
                borderBottom: '1px solid var(--border)',
                '& .MuiIconButton-root, & .MuiSvgIcon-root, & .MuiInputBase-input': {
                    color: 'var(--foreground)',
                },
                '.dark &': {
                    backgroundColor: 'var(--background)',
                    borderBottom: '1px solid var(--border)',
                    '& .MuiIconButton-root, & .MuiSvgIcon-root, & .MuiInputBase-input': {
                        color: 'var(--foreground)',
                    },
                },
            },
        },
        muiBottomToolbarProps: {
            sx: {
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderTop: '1px solid var(--border)',
                '& .MuiIconButton-root:not([disabled]), & .MuiSvgIcon-root': {
                    color: 'var(--foreground)',
                },
                '& .Mui-disabled': {
                    opacity: 0.5,
                },
                '.dark &': {
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderTop: '1px solid var(--border)',
                    '& .MuiIconButton-root:not([disabled]), & .MuiSvgIcon-root': {
                        color: 'var(--foreground)',
                    },
                },
            },
        },

        renderRowActions: ({ row }) => (
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" asChild className="text-[var(--foreground)] hover:bg-[var(--accent)]">
                    <Link href={route('admin.services.edit', { service: row.original.id })} title={translations?.edit_button_title || 'Modifier'}>
                        <Icon icon="mdi:pencil" className="h-5 w-5" />
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteModal(row.original)}
                    className="text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--destructive)]"
                    title={translations?.delete_button_title || 'Supprimer'}
                >
                    <Icon icon="mdi:delete" className="h-5 w-5" />
                </Button>
            </div>
        ),
        renderTopToolbarCustomActions: () => (
            <Button asChild variant="default" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                <Link href={route('admin.services.create')}>{translations?.add_service_button || 'Ajouter Service'}</Link>
            </Button>
        ),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.services_page_title || 'Liste des Services'} />
            <div className="bg-[var(--background)] p-4 text-[var(--foreground)] md:p-6">
                <MaterialReactTable table={table} />
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={translations?.delete_service_modal_title || 'Delete Service'}
                message={
                    itemToDelete
                        ? (translations?.service_delete_confirmation || 'Are you sure you want to delete the service "{name}"?').replace(
                              '{name}',
                              itemToDelete.nom,
                          )
                        : translations?.generic_delete_confirmation || 'Are you sure you want to delete this item?'
                }
                confirmText={translations?.delete_button_title || 'Delete'} // Re-use existing translation
                // cancelText: use default or provide specific
            />
        </AppLayout>
    );
}
