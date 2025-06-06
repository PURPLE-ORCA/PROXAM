import ConfirmationModal from '@/components/Common/ConfirmationModal';
import ImportModal from '@/components/ImportModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useContext, useEffect, useMemo, useState } from 'react';

const statutColors = {
    Active: 'bg-green-500 hover:bg-green-600',
    On_Leave: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    Sick_Leave: 'bg-orange-500 hover:bg-orange-600',
    Vacation: 'bg-blue-500 hover:bg-blue-600',
    Inactive: 'bg-gray-500 hover:bg-gray-600',
    default: 'bg-gray-400 hover:bg-gray-500',
};

const defaultPageSize = 15;
const defaultPageIndex = 0;

export default function Index({ professeurs: professeursPagination, filters, servicesForFilter, rangsForFilter, statutsForFilter }) {
    const { translations, language } = useContext(TranslationContext);
    const { auth } = usePage().props; // Removed PageProps type for JSX

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const getStatutTranslation = (statutKey) => {
        if (!statutKey) return translations?.statut_undefined || 'N/A';
        const translationKey = `professeur_statut_${statutKey.replace('_', '').toLowerCase()}`;
        return translations?.[translationKey] || statutKey.replace('_', ' ');
    };

    const getRangTranslation = (rangKey) => {
        if (!rangKey) return 'N/A';
        const translationKey = `professeur_rang_${rangKey.toLowerCase()}`;
        return translations?.[translationKey] || rangKey;
    };

    const breadcrumbs = useMemo(
        () => [{ title: translations?.professeurs_breadcrumb || 'Professors', href: route('admin.professeurs.index') }],
        [translations],
    );

    const [pagination, setPagination] = useState({
        pageIndex: professeursPagination.current_page - 1 ?? defaultPageIndex,
        pageSize: professeursPagination.per_page ?? defaultPageSize,
    });

    useEffect(() => {
        if (pagination.pageIndex !== professeursPagination.current_page - 1 || pagination.pageSize !== professeursPagination.per_page) {
            router.get(
                route('admin.professeurs.index'),
                {
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize,
                    search: filters?.search || '',
                    service_id: filters?.service_id || undefined,
                    rang: filters?.rang || undefined,
                    statut: filters?.statut || undefined,
                    statut: filters?.date_recrutement || undefined,
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }
    }, [pagination.pageIndex, pagination.pageSize, professeursPagination, filters]);

    const columns = useMemo(
        () => [
            {
                accessorFn: (row) => `${row.prenom} ${row.nom}`,
                id: 'fullName',
                header: translations?.professeur_name_column_header || 'Name',
                size: 200,
            },
            { accessorKey: 'user.email', header: translations?.user_email_column_header || 'Email', size: 250 },
            { accessorKey: 'service.nom', header: translations?.professeur_service_column_header || 'Service', size: 150 },
            {
                accessorKey: 'rang',
                header: translations?.professeur_rank_column_header || 'Rank',
                Cell: ({ cell }) => getRangTranslation(cell.getValue()),
                size: 100,
            },
            {
                accessorKey: 'statut',
                header: translations?.professeur_status_column_header || 'Status',
                Cell: ({ cell }) => {
                    const statut = cell.getValue();
                    const colorClass = statut ? statutColors[statut] || statutColors.default : statutColors.default;
                    return <Badge className={`${colorClass} text-white`}>{getStatutTranslation(statut)}</Badge>;
                },
                size: 120,
            },
            { accessorKey: 'specialite', header: translations?.professeur_specialty_column_header || 'Specialty', size: 150 },
            { accessorKey: 'date_recrutement', header:'recutment', size: 150 },
            {
                accessorKey: 'is_chef_service',
                header: translations?.professeur_is_head_column_header || 'Head',
                Cell: ({ cell }) =>
                    cell.getValue() ? (
                        <Icon icon="mdi:check-circle" className="mx-auto h-5 w-5 text-green-500" />
                    ) : (
                        <Icon icon="mdi:close-circle" className="mx-auto h-5 w-5 text-gray-400" />
                    ),
                size: 80,
                muiTableBodyCellProps: { align: 'center' },
                muiTableHeadCellProps: { align: 'center' },
            },
        ],
        [translations, language], // Removed availableRolesForFilter as it's not used in columns for this specific setup
    );

    const openDeleteModal = (professeurItem) => {
        setItemToDelete(professeurItem);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.professeurs.destroy', { professeur: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => closeDeleteModal(),
                onError: () => closeDeleteModal(),
            });
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: professeursPagination.data || [],
        manualPagination: true,
        state: { pagination },
        rowCount: professeursPagination.total,
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

        renderRowActions: ({ row }) => (
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" asChild className="text-[var(--foreground)] hover:bg-[var(--accent)]">
                    <Link
                        href={route('admin.professeurs.edit', { professeur: row.original.id })}
                        title={translations?.edit_button_title || 'Modifier'}
                    >
                        <Icon icon="mdi:pencil" className="h-5 w-5" />
                    </Link>
                </Button>
                {auth.user?.id !== row.original.user?.id && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteModal(row.original)}
                        className="text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--destructive)]"
                        title={translations?.delete_button_title || 'Supprimer'}
                    >
                        <Icon icon="mdi:delete" className="h-5 w-5" />
                    </Button>
                )}
            </div>
        ),
        renderTopToolbarCustomActions: () => (
            <div className="flex gap-2">
                <Button asChild variant="default" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                    <Link href={route('admin.professeurs.create')}>{translations?.add_professeur_button || 'Add Professor'}</Link>
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setIsImportModalOpen(true)}
                    className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
                >
                    <Icon icon="mdi:upload" className="mr-2 h-5 w-5" />
                    {translations?.import_professors_button || 'Import from File'}
                </Button>
            </div>
        ),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.professeurs_page_title || 'Professors List'} />
            <div className="bg-[var(--background)] p-4 text-[var(--foreground)] md:p-6">
                <MaterialReactTable table={table} />
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={translations?.delete_professeur_modal_title || 'Delete Professor'}
                message={
                    itemToDelete
                        ? (
                              translations?.professeur_delete_confirmation ||
                              'Are you sure you want to delete the professor "{name}"? This will also delete their user account.'
                          ).replace('{name}', `${itemToDelete.prenom} ${itemToDelete.nom}`)
                        : translations?.generic_delete_confirmation || 'Are you sure you want to delete this item?'
                }
                confirmText={translations?.delete_button_title || 'Delete'}
            />
            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />
        </AppLayout>
    );
}
