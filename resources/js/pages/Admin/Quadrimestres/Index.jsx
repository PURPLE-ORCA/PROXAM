import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useContext, useMemo, useState, useCallback } from 'react';
import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { getColumns } from './columns';
import QuadrimestreModal from './QuadrimestreModal';
import { Button } from '@/components/ui/button';

export default function Index({ quadrimestres: quadrimestresPagination, filters, sesons }) {
    const { translations } = useContext(TranslationContext);

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isQuadrimestreModalOpen, setQuadrimestreModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openCreateModal = () => {
        setItemToEdit(null);
        setQuadrimestreModalOpen(true);
    };

    const openEditModal = (quadrimestre) => {
        setItemToEdit(quadrimestre);
        setQuadrimestreModalOpen(true);
    };

    const openDeleteModal = (quadrimestre) => {
        setItemToDelete(quadrimestre);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.quadrimestres.destroy', { quadrimestre: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => setDeleteModalOpen(false),
            });
        }
    };



    const handlePaginationChange = useCallback(({ page, per_page }) => {
        router.get(route('admin.quadrimestres.index'), { page, per_page, search: filters?.search || '' }, { preserveState: true, replace: true });
    }, [filters?.search]);

    const handleSearch = useCallback((search) => {
        router.get(route('admin.quadrimestres.index'), { search, page: 1 }, { preserveState: true, replace: true });
    }, []);

    const columns = useMemo(
        () => getColumns(translations, openEditModal, openDeleteModal),
        [translations]
    );

    return (
        <AppLayout>
            <Head title={translations?.quadrimestres_page_title || 'Semesters'} />
            <div className="p-4 md:p-6">
                 <DataTable
                    columns={columns}
                    data={quadrimestresPagination.data}
                    pagination={quadrimestresPagination}
                    onPaginationChange={handlePaginationChange}
                    onSearch={handleSearch}
                    filters={filters}
                >
                    <Button onClick={openCreateModal}>
                        {translations?.add_quadrimestre_button || 'Add Semester'}
                    </Button>
                </DataTable>
            </div>

            <QuadrimestreModal
                isOpen={isQuadrimestreModalOpen}
                onClose={() => setQuadrimestreModalOpen(false)}
                quadrimestre={itemToEdit}
                sesons={sesons}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={translations?.delete_quadrimestre_modal_title || 'Delete Semester'}
                message={itemToDelete ? `Delete the semester "${itemToDelete.code}"?` : ''}
            />
        </AppLayout>
    );
}
