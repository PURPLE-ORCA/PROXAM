import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useContext, useEffect, useMemo, useState } from 'react';
// Assuming PageProps is defined in your types for usePage().props for auth.abilities
// import { type PageProps } from '@/types';

const defaultPageSize = 15;
const defaultPageIndex = 0;

export default function Index({ sesons: sesonsPagination, filters }) {
    const { translations, language } = useContext(TranslationContext);
    const { auth } = usePage().props; // If using PageProps: const { auth } = usePage<PageProps>().props;

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [processingBatchAssignment, setProcessingBatchAssignment] = useState(null);

    const breadcrumbs = useMemo(() => [{ title: translations?.sesons_breadcrumb || 'Sessions', href: route('admin.sesons.index') }], [translations]);

    const [pagination, setPagination] = useState({
        pageIndex: sesonsPagination.current_page - 1 ?? defaultPageIndex,
        pageSize: sesonsPagination.per_page ?? defaultPageSize,
    });

    useEffect(() => {
        if (pagination.pageIndex !== sesonsPagination.current_page - 1 || pagination.pageSize !== sesonsPagination.per_page) {
            router.get(
                route('admin.sesons.index'),
                {
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize,
                    search: filters?.search || '',
                    // annee_uni_id: filters?.annee_uni_id || undefined, // If filtering by year on this page via query param
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }
    }, [pagination.pageIndex, pagination.pageSize, sesonsPagination, filters]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'code',
                header: translations?.seson_code_column_header || 'Session Code',
                size: 250,
            },
            {
                accessorKey: 'annee_uni.annee',
                header: translations?.annee_uni_year_column_header || 'Academic Year',
                size: 250,
            },
            // You could add a column showing "Pending Assignments" or similar stats for the session
        ],
        [translations, language], // Added language in case any cell formatter depends on it
    );

    const openDeleteModal = (sesonItem) => {
        setItemToDelete(sesonItem);
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };
    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.sesons.destroy', { seson: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => closeDeleteModal(),
                onError: () => closeDeleteModal(),
            });
        }
    };

    const handleBatchAssign = (sesonId) => {
        const confirmationMessage =
            translations?.batch_assign_confirmation_message ||
            'Are you sure you want to run automatic assignments for all pending exams in this session? This may take a moment and cannot be easily undone.';

        if (confirm(confirmationMessage)) {
            // Using simple confirm for now
            setProcessingBatchAssignment(sesonId);
            router.post(
                route('admin.sesons.batch-assign-exams', { seson: sesonId }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log('Batch assignment POST successful, flash:', page.props.flash);
                        // Toast is handled by SonnerToastProvider via flash messages from backend
                    },
                    onError: (errors) => {
                        console.error('Error triggering batch assignment:', errors);
                        // Optionally show a generic error toast here if backend flash isn't sufficient
                    },
                    onFinish: () => {
                        setProcessingBatchAssignment(null);
                    },
                },
            );
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: sesonsPagination.data || [],
        manualPagination: true,
        state: { pagination },
        rowCount: sesonsPagination.total,
        onPaginationChange: setPagination,
        enableEditing: auth.abilities?.is_admin_or_rh, // Or specific permission
        enableRowActions: true, // To show the actions column

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

        renderRowActions: ({ row }) => {
            const seson = row.original;
            // Assuming Admin or RH can perform these actions
            const canManage = auth.abilities?.is_admin || auth.abilities?.is_rh;

            return (
                <div className="flex items-center gap-1">
                    {canManage && (
                        <Button variant="ghost" size="icon" asChild className="text-[var(--foreground)] hover:bg-[var(--accent)]">
                            <Link href={route('admin.sesons.edit', { seson: seson.id })} title={translations?.edit_button_title || 'Modifier'}>
                                <Icon icon="mdi:pencil" className="h-5 w-5" />
                            </Link>
                        </Button>
                    )}

                    {canManage && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleBatchAssign(seson.id)}
                            disabled={processingBatchAssignment === seson.id}
                            className="text-green-500 hover:bg-[var(--accent)]"
                            title={translations?.batch_assign_button_title || 'Assign All Pending Exams'}
                        >
                            {processingBatchAssignment === seson.id ? (
                                <Icon icon="mdi:loading" className="h-5 w-5 animate-spin" />
                            ) : (
                                <Icon icon="mdi:robot-outline" className="h-5 w-5" />
                            )}
                        </Button>
                    )}

                    {auth.abilities?.is_admin && ( // Assuming only pure Admin can delete a session
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteModal(seson)}
                            className="text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--destructive)]"
                            title={translations?.delete_button_title || 'Supprimer'}
                        >
                            <Icon icon="mdi:delete" className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            );
        },
        renderTopToolbarCustomActions: () =>
            (auth.abilities?.is_admin || auth.abilities?.is_rh) && (
                <Button asChild variant="default" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                    <Link href={route('admin.sesons.create')}>{translations?.add_seson_button || 'Add Session'}</Link>
                </Button>
            ),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.sesons_page_title || 'Sessions List'} />
            <div className="bg-[var(--background)] p-4 text-[var(--foreground)] md:p-6">
                <MaterialReactTable table={table} />
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={translations?.delete_seson_modal_title || 'Delete Session'}
                message={
                    itemToDelete
                        ? (translations?.seson_delete_confirmation || 'Are you sure you want to delete the session "{code}"?').replace(
                              '{code}',
                              itemToDelete.code,
                          )
                        : translations?.generic_delete_confirmation
                }
                confirmText={translations?.delete_button_title || 'Delete'}
            />
        </AppLayout>
    );
}
