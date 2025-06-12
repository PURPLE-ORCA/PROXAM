import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Badge } from '@/components/ui/badge';
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

    // State for Delete Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // State for Batch Assign Modal & Processing
    const [isBatchAssignModalOpen, setIsBatchAssignModalOpen] = useState(false);
    const [itemToBatchAssign, setItemToBatchAssign] = useState(null); // Will store the seson object
    const [processingBatchAssignment, setProcessingBatchAssignment] = useState(null); // Tracks seson.id

    // State for Approve & Notify Modal & Processing
    const [showApprovalConfirmation, setShowApprovalConfirmation] = useState(false);
    const [sesonToApprove, setSesonToApprove] = useState(null);
    const [processingApprovalSesonId, setProcessingApprovalSesonId] = useState(null); // Tracks seson.id for approval

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
        ],
        [translations, language],
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

    const openBatchAssignModal = (seson) => {
        setItemToBatchAssign(seson);
        setIsBatchAssignModalOpen(true);
    };

    const closeBatchAssignModal = () => {
        setIsBatchAssignModalOpen(false);
        setItemToBatchAssign(null);
    };

    const confirmBatchAssign = () => {
        if (!itemToBatchAssign) return;
        setProcessingBatchAssignment(itemToBatchAssign.id);
        router.post(
            route('admin.sesons.batch-assign-exams', { seson: itemToBatchAssign.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    console.log('Batch assignment POST successful, flash:', page.props.flash);
                    closeBatchAssignModal();
                },
                onError: (errors) => {
                    console.error('Error triggering batch assignment:', errors);
                    closeBatchAssignModal();
                },
                onFinish: () => {
                    setProcessingBatchAssignment(null);
                },
            },
        );
    };

    const openApprovalConfirmationModal = (seson) => {
        setSesonToApprove(seson);
        setShowApprovalConfirmation(true);
    };

    const closeApprovalConfirmationModal = () => {
        setShowApprovalConfirmation(false);
        setSesonToApprove(null);
    };

    const handleApproveAndNotify = () => {
        if (!sesonToApprove) return;
        setProcessingApprovalSesonId(sesonToApprove.id);
        router.post(
            route('admin.sesons.approve-notifications', sesonToApprove.id),
            {},
            {
                onSuccess: () => {
                    closeApprovalConfirmationModal();
                    // Toast notification is handled by Inertia flash messages
                },
                onError: (errors) => {
                    console.error('Error approving and notifying:', errors);
                    closeApprovalConfirmationModal();
                },
                onFinish: () => setProcessingApprovalSesonId(null),
            },
        );
    };

    const table = useMaterialReactTable({
        columns,
        data: sesonsPagination.data || [],
        manualPagination: true,
        state: { pagination },
        rowCount: sesonsPagination.total,
        onPaginationChange: setPagination,
        enableEditing: auth.abilities?.is_admin_or_rh,
        enableRowActions: true,

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
                            onClick={() => openBatchAssignModal(seson)}
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

                    {auth.abilities?.is_admin && !seson.assignments_approved_at && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openApprovalConfirmationModal(seson)}
                            disabled={processingApprovalSesonId === seson.id}
                            className="text-blue-500 hover:bg-[var(--accent)]"
                            title={translations?.approveAndNotify || 'Approve & Notify'}
                        >
                            <Icon icon="mdi:check-decagram-outline" className="mr-2 h-4 w-4" />
                            {processingApprovalSesonId === seson.id ? (
                                <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
                            ) : (
                                translations?.approveAndNotify || 'Approve & Notify'
                            )}
                        </Button>
                    )}

                    {auth.abilities?.is_admin && seson.assignments_approved_at && (
                        <div className="flex flex-col items-start gap-1">
                            <Badge variant="success" className="mb-1">
                                Approved: {new Date(seson.assignments_approved_at).toLocaleDateString()}
                            </Badge>
                            {seson.notifications_sent_at ? (
                                <Badge variant="success">Notified: {new Date(seson.notifications_sent_at).toLocaleDateString()}</Badge>
                            ) : (
                                <Badge variant="outline">Notification Pending/Failed</Badge>
                            )}

                            {/* New Download Button */}
                            <a href={route('admin.sesons.download-convocations', seson.id)}>
                                <Button variant="outline" size="sm">
                                    <Icon icon="mdi:download-box-outline" className="mr-2 h-4 w-4" />
                                    {translations?.downloadConvocations || 'Download Convocations'}
                                </Button>
                            </a>
                        </div>
                    )}

                    {auth.abilities?.is_admin && (
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

            <ConfirmationModal
                isOpen={isBatchAssignModalOpen}
                onClose={closeBatchAssignModal}
                onConfirm={confirmBatchAssign}
                title={translations?.batch_assign_modal_title || 'Confirm Batch Assignment'}
                message={
                    itemToBatchAssign
                        ? (
                              translations?.batch_assign_confirmation_message ||
                              'Are you sure you want to run automatic assignments for all pending exams in session "{code} ({year})"? This may take a moment and cannot be easily undone.'
                          )
                              .replace('{code}', itemToBatchAssign.code)
                              .replace('{year}', itemToBatchAssign.annee_uni?.annee || '')
                        : translations?.generic_action_confirmation || 'Are you sure you want to proceed?'
                }
                confirmText={translations?.batch_assign_confirm_button || 'Yes, Assign All'}
                destructive={false} // Make confirm button not red for this action
            />

            <ConfirmationModal
                isOpen={showApprovalConfirmation}
                onClose={closeApprovalConfirmationModal}
                onConfirm={handleApproveAndNotify}
                title={translations?.confirmApprovalTitle || "Confirm Approval"}
                description={
                    sesonToApprove
                        ? (translations?.confirmApprovalDescription || `Are you sure you want to approve assignments for seson "${sesonToApprove?.nom}" and notify all assigned professors? This action cannot be undone easily.`)
                            .replace('{sesonName}', sesonToApprove?.nom || '')
                        : translations?.generic_action_confirmation || 'Are you sure you want to proceed?'
                }
                confirmText={translations?.approveAndNotify || 'Approve & Notify'}
                destructive={false}
            />
        </AppLayout>
    );
}
