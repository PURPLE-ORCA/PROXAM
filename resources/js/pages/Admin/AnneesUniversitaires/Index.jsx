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

export default function Index({ anneesUniversitaires: anneesPagination, filters }) {
    const { translations } = useContext(TranslationContext);
    const { auth } = usePage().props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const breadcrumbs = useMemo(
        () => [{ title: translations?.annee_uni_breadcrumb || 'Academic Years', href: route('admin.annees-universitaires.index') }],
        [translations],
    );

    const [pagination, setPagination] = useState({
        pageIndex: anneesPagination.current_page - 1 || defaultPageIndex,
        pageSize: anneesPagination.per_page || defaultPageSize,
    });

    useEffect(() => {
        if (
            pagination.pageIndex !== anneesPagination.current_page - 1 ||
            pagination.pageSize !== anneesPagination.per_page
        ) {
            router.get(
                route('admin.annees-universitaires.index'),
                {
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize,
                    search: filters?.search || '',
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }
    }, [pagination.pageIndex, pagination.pageSize, anneesPagination, filters?.search]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'annee',
                header: translations?.annee_uni_year_column_header || 'Academic Year',
                size: 400,
            },
        ],
        [translations],
    );

    const openDeleteModal = (anneeItem) => {
        setItemToDelete(anneeItem);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.annees-universitaires.destroy', { anneeUni: itemToDelete.id }), { // Use anneeUni
                preserveScroll: true,
                onSuccess: () => closeDeleteModal(),
                onError: () => closeDeleteModal(),
            });
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: anneesPagination.data || [],
        manualPagination: true,
        state: { pagination },
        rowCount: anneesPagination.total,
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
                    <Link href={route('admin.annees-universitaires.edit', { anneeUni: row.original.id })} title={translations?.edit_button_title || 'Modifier'}>
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
                <Link href={route('admin.annees-universitaires.create')}>{translations?.add_annee_uni_button || 'Add Academic Year'}</Link>
            </Button>
        ),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.annee_uni_page_title || 'Academic Years List'} />
            <div className="bg-[var(--background)] p-4 text-[var(--foreground)] md:p-6">
                <MaterialReactTable table={table} />
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={translations?.delete_annee_uni_modal_title || 'Delete Academic Year'}
                message={
                    itemToDelete
                        ? (translations?.annee_uni_delete_confirmation || 'Are you sure you want to delete the academic year "{year}"?').replace('{year}', itemToDelete.annee)
                        : translations?.generic_delete_confirmation || 'Are you sure you want to delete this item?'
                }
                confirmText={translations?.delete_button_title || 'Delete'}
            />
        </AppLayout>
    );
}