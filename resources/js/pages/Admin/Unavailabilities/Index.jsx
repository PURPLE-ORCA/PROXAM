import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useContext, useEffect, useMemo, useState } from 'react';

const defaultPageSize = 15;
const defaultPageIndex = 0;

export default function Index({ unavailabilities: unavailabilitiesPagination, filters, professeursForFilter }) {
    const { translations, language } = useContext(TranslationContext);
    const { auth } = usePage().props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const formatDate = (datetimeString) => {
        if (!datetimeString) return 'N/A';
        try {
            return new Date(datetimeString).toLocaleString(language, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return datetimeString;
        }
    };

    const breadcrumbs = useMemo(
        () => [{ title: translations?.unavailabilities_breadcrumb || 'Prof. Unavailabilities', href: route('admin.unavailabilities.index') }],
        [translations],
    );

    const [pagination, setPagination] = useState({
        pageIndex: unavailabilitiesPagination.current_page - 1 ?? defaultPageIndex,
        pageSize: unavailabilitiesPagination.per_page ?? defaultPageSize,
    });

    useEffect(() => {
        if (pagination.pageIndex !== unavailabilitiesPagination.current_page - 1 || pagination.pageSize !== unavailabilitiesPagination.per_page) {
            router.get(
                route('admin.unavailabilities.index'),
                {
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize,
                    search: filters?.search || '',
                    professeur_id: filters?.professeur_id || undefined,
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }
    }, [pagination.pageIndex, pagination.pageSize, unavailabilitiesPagination, filters]);

    const columns = useMemo(
        () => [
            {
                accessorFn: (row) => `${row.professeur?.prenom || ''} ${row.professeur?.nom || 'N/A'}`,
                id: 'professeurFullName',
                header: translations?.unavailability_professeur_column_header || 'Professor',
                size: 250,
            },
            {
                accessorKey: 'start_datetime',
                header: translations?.unavailability_start_column_header || 'Start Time',
                Cell: ({ cell }) => formatDate(cell.getValue()),
                size: 180,
            },
            {
                accessorKey: 'end_datetime',
                header: translations?.unavailability_end_column_header || 'End Time',
                Cell: ({ cell }) => formatDate(cell.getValue()),
                size: 180,
            },
            { accessorKey: 'reason', header: translations?.unavailability_reason_column_header || 'Reason', size: 300 },
        ],
        [translations, language],
    );

    const openDeleteModal = (item) => {
        setItemToDelete(item);
        setIsModalOpen(true);
    };
    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };
    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.unavailabilities.destroy', { unavailability: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => closeDeleteModal(),
                onError: () => closeDeleteModal(),
            });
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: unavailabilitiesPagination.data || [],
        manualPagination: true,
        state: { pagination },
        rowCount: unavailabilitiesPagination.total,
        onPaginationChange: setPagination,
        enableEditing: auth.abilities?.is_admin_or_rh,
        enableRowActions: auth.abilities?.is_admin_or_rh,

        muiTablePaperProps: {
            elevation: 0,
            sx: { borderRadius: 'var(--radius-md)', backgroundColor: 'var(--background)', '.dark &': { backgroundColor: 'var(--background)' } },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                fontWeight: '600',
                borderBottomWidth: '2px',
                borderColor: 'var(--border)',
                '& .MuiSvgIcon-root': { color: 'var(--foreground)' },
                '.dark &': {
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)',
                    '& .MuiSvgIcon-root': { color: 'var(--foreground)' },
                },
            },
        },
        muiTableBodyCellProps: {
            sx: {
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderBottom: '1px solid var(--border)',
                '.dark &': { backgroundColor: 'var(--background)', color: 'var(--foreground)', borderBottom: '1px solid var(--border)' },
            },
        },
        muiTableBodyRowProps: {
            sx: {
                backgroundColor: 'transparent',
                '&:hover td': { backgroundColor: 'var(--accent)', '.dark &': { backgroundColor: 'var(--accent)' } },
            },
        },
        muiTopToolbarProps: {
            sx: {
                backgroundColor: 'var(--background)',
                borderBottom: '1px solid var(--border)',
                '& .MuiIconButton-root, & .MuiSvgIcon-root, & .MuiInputBase-input': { color: 'var(--foreground)' },
                '.dark &': {
                    backgroundColor: 'var(--background)',
                    borderBottom: '1px solid var(--border)',
                    '& .MuiIconButton-root, & .MuiSvgIcon-root, & .MuiInputBase-input': { color: 'var(--foreground)' },
                },
            },
        },
        muiBottomToolbarProps: {
            sx: {
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderTop: '1px solid var(--border)',
                '& .MuiIconButton-root:not([disabled]), & .MuiSvgIcon-root': { color: 'var(--foreground)' },
                '& .Mui-disabled': { opacity: 0.5 },
                '.dark &': {
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderTop: '1px solid var(--border)',
                    '& .MuiIconButton-root:not([disabled]), & .MuiSvgIcon-root': { color: 'var(--foreground)' },
                },
            },
        },

        renderRowActions: ({ row }) => (
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" asChild className="text-[var(--foreground)] hover:bg-[var(--accent)]">
                    <Link
                        href={route('admin.unavailabilities.edit', { unavailability: row.original.id })}
                        title={translations?.edit_button_title || 'Modifier'}
                    >
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
                <Link href={route('admin.unavailabilities.create')}>{translations?.add_unavailability_button || 'Add Unavailability'}</Link>
            </Button>
        ),
        // TODO: Add inputs for server-side filtering (search by professor name/reason, select professor)
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.unavailabilities_page_title || 'Professor Unavailabilities'} />
            <div className="bg-[var(--background)] p-4 text-[var(--foreground)] md:p-6">
                <MaterialReactTable table={table} />
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={translations?.delete_unavailability_modal_title || 'Delete Unavailability'}
                message={
                    itemToDelete
                        ? (
                              translations?.unavailability_delete_confirmation ||
                              'Are you sure you want to delete this unavailability period for {profName}?'
                          ).replace('{profName}', `${itemToDelete.professeur?.prenom || ''} ${itemToDelete.professeur?.nom || ''}`.trim())
                        : translations?.generic_delete_confirmation || 'Are you sure you want to delete this item?'
                }
                confirmText={translations?.delete_button_title || 'Delete'}
            />
        </AppLayout>
    );
}
