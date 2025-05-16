import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'; // Removed type MRT_ColumnDef for JSX
import { useContext, useEffect, useMemo, useState } from 'react';
// Removed PageProps and other type imports for JSX
// import { type PageProps } from '@/types';

const defaultPageSize = 15;
const defaultPageIndex = 0;

export default function Index({ examens: examensPagination, filters }) {
    const { translations, language } = useContext(TranslationContext);
    const { auth } = usePage().props; // Removed PageProps type for JSX

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [processingAssignment, setProcessingAssignment] = useState(null); // Track which exam assignment is processing

    const formatDate = (datetimeString) => {
        if (!datetimeString) return 'N/A';
        try {
            return new Date(datetimeString).toLocaleString(language, {
                // Use current language for formatting
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return datetimeString; // Fallback
        }
    };

    const getTypeTranslation = (typeKey) => {
        if (!typeKey) return 'N/A';
        const translationKey = `examen_type_${typeKey.toLowerCase()}`;
        return translations?.[translationKey] || typeKey;
    };

    const getFiliereTranslation = (filiereKey) => {
        if (!filiereKey) return 'N/A';
        const translationKey = `examen_filiere_${filiereKey.toLowerCase()}`;
        return translations?.[translationKey] || filiereKey;
    };

    const breadcrumbs = useMemo(
        () => [{ title: translations?.examens_breadcrumb || 'Examinations', href: route('admin.examens.index') }],
        [translations],
    );

    const [pagination, setPagination] = useState({
        pageIndex: examensPagination.current_page - 1 ?? defaultPageIndex,
        pageSize: examensPagination.per_page ?? defaultPageSize,
    });

    useEffect(() => {
        if (pagination.pageIndex !== examensPagination.current_page - 1 || pagination.pageSize !== examensPagination.per_page) {
            router.get(
                route('admin.examens.index'),
                {
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize,
                    search: filters?.search || '',
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }
    }, [pagination.pageIndex, pagination.pageSize, examensPagination, filters]);

    const columns = useMemo(
        () => [
            { accessorKey: 'nom', header: translations?.examen_name_column_header || 'Exam Name', size: 200 },
            { accessorKey: 'module.nom', header: translations?.module_name_column_header || 'Module', size: 150 },
            {
                accessorKey: 'quadrimestre.code', // Display Quadrimestre code
                header: translations?.quadrimestre_code_column_header || 'Semester',
                Cell: ({ row }) =>
                    `${row.original.quadrimestre?.seson?.annee_uni?.annee || ''} - ${row.original.quadrimestre?.seson?.code || ''} - ${row.original.quadrimestre?.code || ''}`,
                size: 200,
            },
            {
                accessorKey: 'type',
                header: translations?.examen_type_column_header || 'Type',
                Cell: ({ cell }) => getTypeTranslation(cell.getValue()),
                size: 100,
            },
            {
                accessorKey: 'filiere',
                header: translations?.examen_filiere_column_header || 'Field',
                Cell: ({ cell }) => getFiliereTranslation(cell.getValue()),
                size: 100,
            },
            {
                accessorKey: 'debut',
                header: translations?.examen_start_time_column_header || 'Start Time',
                Cell: ({ cell }) => formatDate(cell.getValue()),
                size: 180,
            },
            {
                accessorKey: 'fin',
                header: translations?.examen_end_time_column_header || 'End Time',
                Cell: ({ cell }) => formatDate(cell.getValue()),
                size: 180,
            },
            {
                accessorKey: 'required_professors',
                header: translations?.examen_req_profs_column_header || 'Req. Profs',
                size: 80,
                muiTableBodyCellProps: { align: 'center' },
                muiTableHeadCellProps: { align: 'center' },
            },
            {
                // New column to show how many are assigned
                accessorKey: 'attributions_count',
                header: translations?.examen_assigned_profs_column_header || 'Assigned',
                size: 80,
                muiTableBodyCellProps: { align: 'center' },
                muiTableHeadCellProps: { align: 'center' },
            },
        ],
        [translations, language],
    );

    const openDeleteModal = (examenItem) => {
        setItemToDelete(examenItem);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.examens.destroy', { examen: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => closeDeleteModal(),
                onError: () => closeDeleteModal(),
            });
        }
    };

    const handleTriggerAssignment = (examenId) => {
        setProcessingAssignment(examenId); // Set processing state for this specific exam
        router.post(
            route('admin.examens.trigger-assignment', { examen: examenId }),
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    console.log('Assignment triggered successfully:', page.props.flash);
                    // Toast is handled by flash message from backend
                    setProcessingAssignment(null);
                },
                onError: (errors) => {
                    // Toast for error is handled by flash message
                    console.error('Error triggering assignment:', errors);
                    setProcessingAssignment(null);
                },
                onFinish: () => {
                    console.log('Assignment request finished (onFinish)');
                    // Ensure processing state is cleared even if not success/error
                    setProcessingAssignment(null);
                },
            },
        );
    };

    const table = useMaterialReactTable({
        columns,
        data: examensPagination.data || [],
        manualPagination: true,
        state: { pagination },
        rowCount: examensPagination.total,
        onPaginationChange: setPagination,
        enableEditing: auth.abilities?.is_admin,
        enableRowActions: auth.abilities?.is_admin,

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
            const examen = row.original;
            const canAssign = examen.attributions_count < examen.required_professors;

            return (
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild className="text-[var(--foreground)] hover:bg-[var(--accent)]">
                        <Link href={route('admin.examens.edit', { examen: examen.id })} title={translations?.edit_button_title || 'Modifier'}>
                            <Icon icon="mdi:pencil" className="h-5 w-5" />
                        </Link>
                    </Button>

                    {/* Assign Professors Button */}
                    {canAssign && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTriggerAssignment(examen.id)}
                            disabled={processingAssignment === examen.id} // Disable button while processing this specific exam
                            className="text-blue-500 hover:bg-[var(--accent)]" // Example color
                            title={translations?.trigger_assignment_button_title || 'Assign Professors'}
                        >
                            {processingAssignment === examen.id ? (
                                <Icon icon="mdi:loading" className="h-5 w-5 animate-spin" />
                            ) : (
                                <Icon icon="mdi:account-multiple-plus-outline" className="h-5 w-5" />
                            )}
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteModal(examen)}
                        className="text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--destructive)]"
                        title={translations?.delete_button_title || 'Supprimer'}
                    >
                        <Icon icon="mdi:delete" className="h-5 w-5" />
                    </Button>
                </div>
            );
        },
        renderTopToolbarCustomActions: () => (
            <Button asChild variant="default" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                <Link href={route('admin.examens.create')}>{translations?.add_examen_button || 'Add Examination'}</Link>
            </Button>
        ),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.examens_page_title || 'Examinations List'} />
            <div className="bg-[var(--background)] p-4 text-[var(--foreground)] md:p-6">
                <MaterialReactTable table={table} />
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={translations?.delete_examen_modal_title || 'Delete Examination'}
                message={
                    itemToDelete
                        ? (translations?.examen_delete_confirmation || 'Are you sure you want to delete the examination "{name}"?').replace(
                              '{name}',
                              itemToDelete.nom || 'Unnamed Exam',
                          )
                        : translations?.generic_delete_confirmation || 'Are you sure you want to delete this item?'
                }
                confirmText={translations?.delete_button_title || 'Delete'}
            />
        </AppLayout>
    );
}
