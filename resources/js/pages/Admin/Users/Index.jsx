import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useContext, useEffect, useMemo, useState } from 'react';

// Define roleColors for consistent styling, can be moved to a config or theme file
const roleColors = {
    admin: 'bg-red-500 hover:bg-red-600',
    rh: 'bg-blue-500 hover:bg-blue-600',
    professeur: 'bg-green-500 hover:bg-green-600',
    chef_service: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    default: 'bg-gray-500 hover:bg-gray-600',
};

const defaultPageSize = 30;
const defaultPageIndex = 0;

export default function Index({ users: usersPagination, filters, roles: availableRolesForFilter }) {
    const { translations, language } = useContext(TranslationContext); // language might be needed for getRoleTranslation if it's more complex
    const { auth } = usePage().props; // No generic type needed for usePage in JSX

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const getRoleTranslation = (roleKey) => {
        if (!roleKey) return translations?.role_undefined || 'N/A';
        const translationKey = `role_${roleKey}`;
        return translations?.[translationKey] || roleKey.charAt(0).toUpperCase() + roleKey.slice(1);
    };

    const breadcrumbs = useMemo(() => [{ title: translations?.users_breadcrumb || 'Users', href: route('admin.users.index') }], [translations]);

    const [pagination, setPagination] = useState({
        pageIndex: usersPagination.current_page - 1 ?? defaultPageIndex,
        pageSize: usersPagination.per_page ?? defaultPageSize,
    });

    useEffect(() => {
        if (pagination.pageIndex !== usersPagination.current_page - 1 || pagination.pageSize !== usersPagination.per_page) {
            router.get(
                route('admin.users.index'),
                {
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize,
                    search: filters?.search || '',
                    role: filters?.role || undefined,
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }
    }, [pagination.pageIndex, pagination.pageSize, usersPagination, filters]);

    const columns = useMemo(
        () => [
            { accessorKey: 'name', header: translations?.user_name_column_header || 'Name', size: 250 },
            { accessorKey: 'email', header: translations?.user_email_column_header || 'Email', size: 300 },
            {
                accessorKey: 'role',
                header: translations?.user_role_column_header || 'Role',
                Cell: ({ cell }) => {
                    const role = cell.getValue();
                    const colorClass = role ? roleColors[role] || roleColors.default : roleColors.default;
                    return <Badge className={`${colorClass} text-white`}>{getRoleTranslation(role)}</Badge>;
                },
                size: 150,
            },
            {
                accessorKey: 'email_verified_at',
                header: translations?.user_email_verified_column_header || 'Verified',
                Cell: ({ cell }) =>
                    cell.getValue() ? (
                        <Icon icon="mdi:check-circle" className="mx-auto h-5 w-5 text-green-500" />
                    ) : (
                        <Icon icon="mdi:close-circle" className="mx-auto h-5 w-5 text-red-500" />
                    ),
                size: 100,
                muiTableBodyCellProps: { align: 'center' },
                muiTableHeadCellProps: { align: 'center' },
            },
        ],
        [translations, language, availableRolesForFilter], // language dependency if getRoleTranslation uses it
    );

    const openDeleteModal = (userItem) => {
        setItemToDelete(userItem);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.users.destroy', { user: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => closeDeleteModal(),
                onError: () => {
                    closeDeleteModal();
                },
            });
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: usersPagination.data || [],
        manualPagination: true,
        state: { pagination },
        rowCount: usersPagination.total,
        onPaginationChange: setPagination,
        enableEditing: auth.abilities?.is_admin, // Relies on backend structure of auth.abilities
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
                    <Link href={route('admin.users.edit', { user: row.original.id })} title={translations?.edit_button_title || 'Modifier'}>
                        <Icon icon="mdi:pencil" className="h-5 w-5" />
                    </Link>
                </Button>
                {auth.user?.id !== row.original.id && (
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
            <Button asChild variant="default" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                <Link href={route('admin.users.create')}>{translations?.add_user_button || 'Add User'}</Link>
            </Button>
        ),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.users_page_title || 'Users List'} />
            <div className="bg-[var(--background)] p-4 text-[var(--foreground)] md:p-6">
                <MaterialReactTable table={table} />
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={translations?.delete_user_modal_title || 'Delete User'}
                message={
                    itemToDelete
                        ? (
                              translations?.user_delete_confirmation ||
                              'Are you sure you want to delete the user "{name}"? This may also delete associated professor data.'
                          ).replace('{name}', itemToDelete.name)
                        : translations?.generic_delete_confirmation || 'Are you sure you want to delete this item?'
                }
                confirmText={translations?.delete_button_title || 'Delete'}
            />
        </AppLayout>
    );
}
