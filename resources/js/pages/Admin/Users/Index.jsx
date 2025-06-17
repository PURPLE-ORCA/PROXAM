import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState, useCallback, useEffect } from 'react';
import ConfirmationModal from "@/components/Common/ConfirmationModal";
import { DataTable } from "@/components/DataTable";
import { getColumns } from './columns';
import UserModal from './UserModal';
import UserTableToolbar from './UserTableToolbar';
import { Button } from "@/components/ui/button";

export default function Index({ users: usersPagination, filters, rolesForFilter, rolesForForm }) {
    const { auth } = usePage().props;

    // A single state object for all filters
    const [activeFilters, setActiveFilters] = useState({
        search: filters.search || '',
        role: filters.role || '',
        verified: filters.verified || '',
        page: usersPagination.current_page,
        per_page: usersPagination.per_page,
        sortBy: filters.sortBy || 'name',
        sortDirection: filters.sortDirection || 'asc',
    });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const openCreateModal = () => setIsCreateModalOpen(true);
    const openEditModal = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };
    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedUser) {
            router.delete(route('admin.users.destroy', selectedUser.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedUser(null);
                },
                onError: (errors) => {
                    console.error("Delete error:", errors);
                    setIsDeleteModalOpen(false);
                    setSelectedUser(null);
                }
            });
        }
    };
    
    // Debounced effect to apply filters whenever they change
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('admin.users.index'), activeFilters, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [activeFilters]);

    // A single handler for all filter changes from the toolbar
    const handleFilterChange = (newFilters) => {
        setActiveFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    // Handler for pagination from the DataTable
    const handlePaginationChange = useCallback(({ page, per_page }) => {
        setActiveFilters(prev => ({...prev, page, per_page}));
    }, []);

    // Handler for sorting from TanStack Table (passed to DataTable)
    const handleSortingChange = (sorting) => {
        const sort = sorting[0]; // TanStack table gives an array
        if (sort) {
            setActiveFilters(prev => ({...prev, sortBy: sort.id, sortDirection: sort.desc ? 'desc' : 'asc'}));
        } else {
            // Reset to default sort
            setActiveFilters(prev => ({...prev, sortBy: 'name', sortDirection: 'asc'}));
        }
    };

    const columns = useMemo(() => getColumns(auth, openEditModal, openDeleteModal), [auth]);

    return (
        <AppLayout>
            <Head title="Users" />
            <div className="p-4 md:p-6">
                 <UserTableToolbar
                    filters={activeFilters}
                    onFilterChange={handleFilterChange}
                    rolesForFilter={rolesForFilter}
                >
                    <Button onClick={openCreateModal}>Add User</Button>
                </UserTableToolbar>
                 <DataTable
                    columns={columns}
                    data={usersPagination.data}
                    pagination={usersPagination}
                    onPaginationChange={handlePaginationChange}
                    onSortingChange={handleSortingChange}
                    sorting={[{ id: activeFilters.sortBy, desc: activeFilters.sortDirection === 'desc' }]}
                />
            </div>
            <UserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                roles={rolesForForm}
            />
            {selectedUser && (
                <UserModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={selectedUser}
                    roles={rolesForForm}
                />
            )}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Delete"
                message={`Are you sure you want to delete user "${selectedUser?.name}"? This action cannot be undone.`}
            />
        </AppLayout>
    );
}
