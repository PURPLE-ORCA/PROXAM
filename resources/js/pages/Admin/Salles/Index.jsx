import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useContext, useMemo, useState, useCallback } from 'react';
import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { getColumns } from './columns';
import SalleModal from './SalleModal';
import { Button } from '@/components/ui/button';

export default function Index({ salles: sallesPagination, filters }) {
    const { translations } = useContext(TranslationContext);

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isSalleModalOpen, setSalleModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openCreateModal = () => {
        setItemToEdit(null);
        setSalleModalOpen(true);
    };

    const openEditModal = (salle) => {
        setItemToEdit(salle);
        setSalleModalOpen(true);
    };

    const openDeleteModal = (salle) => {
        setItemToDelete(salle);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.salles.destroy', { salle: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => setDeleteModalOpen(false),
            });
        }
    };

    const handlePaginationChange = useCallback(({ page, per_page }) => {
        router.get(route('admin.salles.index'), { page, per_page, search: filters?.search || '' }, { preserveState: true, replace: true });
    }, [filters?.search]);

    const handleSearch = useCallback((search) => {
        router.get(route('admin.salles.index'), { search, page: 1 }, { preserveState: true, replace: true });
    }, []);

    const columns = useMemo(
        () => getColumns(translations, openEditModal, openDeleteModal),
        [translations]
    );

    return (
        <AppLayout>
            <Head title={translations?.salles_page_title || 'Rooms'} />
            <div className="p-4 md:p-6">
                 <DataTable
                    columns={columns}
                    data={sallesPagination.data}
                    pagination={sallesPagination}
                    onPaginationChange={handlePaginationChange}
                    onSearch={handleSearch}
                    filters={filters}
                >
                    <Button onClick={openCreateModal}>
                        {translations?.add_salle_button || 'Add Room'}
                    </Button>
                </DataTable>
            </div>

            <SalleModal
                isOpen={isSalleModalOpen}
                onClose={() => setSalleModalOpen(false)}
                salle={itemToEdit}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={translations?.delete_salle_modal_title || 'Delete Room'}
                message={itemToDelete ? `Delete the room "${itemToDelete.nom}"?` : ''}
            />
        </AppLayout>
    );
}
