import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState, useCallback } from 'react';
import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import SimpleTableToolbar from '@/components/SimpleTableToolbar';
import { Button } from '@/components/ui/button';
import { getColumns } from './columns';
import UnavailabilityModal from './UnavailabilityModal';

export default function Index({ unavailabilities: unavailabilitiesPagination, filters, professeursForForm, anneeUnisForForm }) {

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isUnavailabilityModalOpen, setUnavailabilityModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openCreateModal = () => { setItemToEdit(null); setUnavailabilityModalOpen(true); };
    const openEditModal = (item) => { setItemToEdit(item); setUnavailabilityModalOpen(true); };
    const openDeleteModal = (item) => { setItemToDelete(item); setDeleteModalOpen(true); };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.unavailabilities.destroy', { unavailability: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => setDeleteModalOpen(false),
            });
        }
    };

    const handlePaginationChange = useCallback(({ page, per_page }) => {
        router.get(route('admin.unavailabilities.index'), { page, per_page, search: filters?.search || '' }, { preserveState: true, replace: true });
    }, [filters?.search]);

    const handleSearch = useCallback((search) => {
        router.get(route('admin.unavailabilities.index'), { search, page: 1 }, { preserveState: true, replace: true });
    }, []);

    const columns = useMemo(() => getColumns(openEditModal, openDeleteModal), []);

    return (
        <AppLayout>
            <Head title="Professor Unavailabilities" />
            <div className="p-4 md:p-6">
                <SimpleTableToolbar filters={filters} onSearch={handleSearch} placeholder="Filter by professor or reason...">
                    <Button onClick={openCreateModal}>Add Unavailability</Button>
                </SimpleTableToolbar>

                <DataTable
                    columns={columns}
                    data={unavailabilitiesPagination.data}
                    pagination={unavailabilitiesPagination}
                    onPaginationChange={handlePaginationChange}
                />
            </div>

            <UnavailabilityModal
                isOpen={isUnavailabilityModalOpen}
                onClose={() => setUnavailabilityModalOpen(false)}
                unavailability={itemToEdit}
                professeurs={professeursForForm}
                anneeUnis={anneeUnisForForm}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Unavailability"
                message={`Are you sure you want to delete this unavailability period?`}
            />
        </AppLayout>
    );
}
