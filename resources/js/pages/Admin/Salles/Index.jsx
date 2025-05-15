import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { TranslationContext } from '@/context/TranslationProvider';
import { Button } from '@/components/ui/button';
import ConfirmationModal from '@/components/Common/ConfirmationModal';

const defaultPageSize = 15;
const defaultPageIndex = 0;

export default function Index({ salles: sallesPagination, filters }) {
    const { translations } = useContext(TranslationContext);
    const { auth } = usePage().props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const breadcrumbs = useMemo(
        () => [{ title: translations?.salles_breadcrumb || 'Salles', href: route('admin.salles.index') }],
        [translations],
    );

    const [pagination, setPagination] = useState({
        pageIndex: sallesPagination.current_page - 1 ?? defaultPageIndex,
        pageSize: sallesPagination.per_page ?? defaultPageSize,
    });

    useEffect(() => {
        if (
            pagination.pageIndex !== sallesPagination.current_page - 1 ||
            pagination.pageSize !== sallesPagination.per_page
        ) {
            router.get(
                route('admin.salles.index'),
                {
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize,
                    search: filters?.search || '',
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }
    }, [pagination.pageIndex, pagination.pageSize, sallesPagination, filters?.search]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'nom',
                header: translations?.salle_name_column_header || 'Nom de la Salle',
                size: 300,
            },
            {
                accessorKey: 'default_capacite',
                header: translations?.salle_capacity_column_header || 'Capacité par Défaut',
                size: 150,
                muiTableBodyCellProps: { align: 'right' },
                muiTableHeadCellProps: { align: 'right' },
            },
        ],
        [translations],
    );

    const openDeleteModal = (salleItem) => {
        setItemToDelete(salleItem);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.salles.destroy', { salle: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => closeDeleteModal(),
                onError: () => closeDeleteModal(),
            });
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: sallesPagination.data || [],
        manualPagination: true,
        state: { pagination },
        rowCount: sallesPagination.total,
        onPaginationChange: setPagination,
        enableEditing: auth.abilities?.is_admin,
        enableRowActions: auth.abilities?.is_admin,

        muiTablePaperProps: { elevation: 0, sx: { borderRadius: 'var(--radius-md)', backgroundColor: 'var(--background)', '.dark &': { backgroundColor: 'var(--background)'}}},
        muiTableHeadCellProps: { sx: { backgroundColor: 'var(--background)', color: 'var(--foreground)', fontWeight: '600', borderBottomWidth: '2px', borderColor: 'var(--border)', '& .MuiSvgIcon-root': { color: 'var(--foreground)'}, '.dark &': { backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border)', '& .MuiSvgIcon-root': { color: 'var(--foreground)'}}}},
        muiTableBodyCellProps: { sx: { backgroundColor: 'var(--background)', color: 'var(--foreground)', borderBottom: '1px solid var(--border)', '.dark &': { backgroundColor: 'var(--background)', color: 'var(--foreground)', borderBottom: '1px solid var(--border)'}}},
        muiTableBodyRowProps: { sx: { backgroundColor: 'transparent', '&:hover td': { backgroundColor: 'var(--accent)', '.dark &': { backgroundColor: 'var(--accent)'}}}},
        muiTopToolbarProps: { sx: { backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)', '& .MuiIconButton-root, & .MuiSvgIcon-root, & .MuiInputBase-input': { color: 'var(--foreground)'}, '.dark &': { backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)', '& .MuiIconButton-root, & .MuiSvgIcon-root, & .MuiInputBase-input': { color: 'var(--foreground)'}}}},
        muiBottomToolbarProps: { sx: { backgroundColor: 'var(--background)', color: 'var(--foreground)', borderTop: '1px solid var(--border)', '& .MuiIconButton-root:not([disabled]), & .MuiSvgIcon-root': { color: 'var(--foreground)'}, '& .Mui-disabled': { opacity: 0.5 }, '.dark &': { backgroundColor: 'var(--background)', color: 'var(--foreground)', borderTop: '1px solid var(--border)', '& .MuiIconButton-root:not([disabled]), & .MuiSvgIcon-root': { color: 'var(--foreground)'}}}},

        renderRowActions: ({ row }) => (
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" asChild className="text-[var(--foreground)] hover:bg-[var(--accent)]">
                    <Link href={route('admin.salles.edit', { salle: row.original.id })} title={translations?.edit_button_title || 'Modifier'}>
                        <Icon icon="mdi:pencil" className="h-5 w-5" />
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openDeleteModal(row.original)} className="text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--destructive)]" title={translations?.delete_button_title || 'Supprimer'}>
                    <Icon icon="mdi:delete" className="h-5 w-5" />
                </Button>
            </div>
        ),
        renderTopToolbarCustomActions: () => (
            <Button asChild variant="default" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                <Link href={route('admin.salles.create')}>{translations?.add_salle_button || 'Ajouter Salle'}</Link>
            </Button>
        ),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.salles_page_title || 'Liste des Salles'} />
            <div className="bg-[var(--background)] p-4 text-[var(--foreground)] md:p-6">
                <MaterialReactTable table={table} />
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={translations?.delete_salle_modal_title || 'Delete Salle'}
                message={
                    itemToDelete
                        ? (translations?.salle_delete_confirmation || 'Are you sure you want to delete the salle "{name}"?').replace('{name}', itemToDelete.nom)
                        : translations?.generic_delete_confirmation || 'Are you sure you want to delete this item?'
                }
                confirmText={translations?.delete_button_title || 'Delete'}
            />
        </AppLayout>
    );
}