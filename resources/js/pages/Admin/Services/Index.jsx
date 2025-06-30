import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useContext, useMemo, useState, useCallback } from 'react';
import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { DataTable } from '@/components/DataTable'; // Our new reusable table
import { getColumns } from './columns'; // Our new column definitions
import ServiceModal from './ServiceModal'; // Our new create/edit modal
import { Button } from '@/components/ui/button';
import SimpleTableToolbar from '@/components/SimpleTableToolbar'; // <-- Import the simple toolbar

export default function Index({ services: servicesPagination, filters }) {
    const { translations } = useContext(TranslationContext);

    // State management for modals
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openCreateModal = () => {
        setItemToEdit(null);
        setServiceModalOpen(true);
    };

    const openEditModal = (service) => {
        setItemToEdit(service);
        setServiceModalOpen(true);
    };

    const openDeleteModal = (service) => {
        setItemToDelete(service);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.services.destroy', { service: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => setDeleteModalOpen(false),
            });
        }
    };

    const handlePaginationChange = ({ page, per_page }) => {
        router.get(route('admin.services.index'), { page, per_page, search: filters?.search || '' }, { preserveState: true, replace: true });
    };

    const handleSearch = useCallback((search) => {
        router.get(route('admin.services.index'), { search, page: 1 }, { preserveState: true, replace: true });
    }, []);

    const columns = useMemo(
        () => getColumns(translations, openEditModal, openDeleteModal),
        [translations],
    );

    return (
        <AppLayout>
            <Head title={translations?.services_page_title || 'Services'} />
            <div className="p-4 md:p-6">
                {/* Explicitly render the toolbar we want */}
                <SimpleTableToolbar
                    filters={filters}
                    onSearch={handleSearch}
                    placeholder="Filter services..."
                >
                    <Button onClick={openCreateModal}>
                        {translations?.add_service_button || 'Add Service'}
                    </Button>
                </SimpleTableToolbar>

                <DataTable
                    columns={columns}
                    data={servicesPagination.data}
                    pagination={servicesPagination}
                    onPaginationChange={handlePaginationChange}
                />
            </div>

            {/* Modals are now rendered here, controlled by state */}
            <ServiceModal
                isOpen={isServiceModalOpen}
                onClose={() => setServiceModalOpen(false)}
                service={itemToEdit}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={translations?.delete_service_modal_title || 'Delete Service'}
                message={itemToDelete ? `Delete the service "${itemToDelete.nom}"?` : ''}
            />
        </AppLayout>
    );
}
