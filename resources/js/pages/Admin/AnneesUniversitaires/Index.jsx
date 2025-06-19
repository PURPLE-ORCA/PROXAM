import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useContext, useMemo, useState, useCallback } from 'react';
import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { DataTable } from '@/components/DataTable';
import { getColumns } from './columns';
import AnneeUniModal from './AnneeUniModal';
import { Button } from '@/components/ui/button';
import SimpleTableToolbar from '@/components/SimpleTableToolbar'; // <-- Import the simple toolbar

export default function Index({ anneesUniversitaires: anneesPagination, filters }) {
    const { translations } = useContext(TranslationContext);

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isAnneeUniModalOpen, setAnneeUniModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const openCreateModal = () => {
        setItemToEdit(null);
        setAnneeUniModalOpen(true);
    };

    const openEditModal = (anneeUni) => {
        setItemToEdit(anneeUni);
        setAnneeUniModalOpen(true);
    };

    const openDeleteModal = (anneeUni) => {
        setItemToDelete(anneeUni);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.annees-universitaires.destroy', { anneeUni: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => setDeleteModalOpen(false),
            });
        }
    };

    const handlePaginationChange = useCallback(({ page, per_page }) => {
        router.get(route('admin.annees-universitaires.index'), { page, per_page, search: filters?.search || '' }, { preserveState: true, replace: true });
    }, [filters?.search]);

    const handleSearch = useCallback((search) => {
        router.get(route('admin.annees-universitaires.index'), { search, page: 1 }, { preserveState: true, replace: true });
    }, []);

    const columns = useMemo(
        () => getColumns(translations, openEditModal, openDeleteModal),
        [translations]
    );

    return (
        <AppLayout>
            <Head title={translations?.annee_uni_page_title || 'Academic Years'} />
            <div className="p-4 md:p-6">
                <SimpleTableToolbar
                    filters={filters}
                    onSearch={handleSearch}
                    placeholder="Filter academic years..."
                >
                    <Button onClick={openCreateModal}>
                        {translations?.add_annee_uni_button || 'Add Academic Year'}
                    </Button>
                </SimpleTableToolbar>

                <DataTable
                    columns={columns}
                    data={anneesPagination.data}
                    pagination={anneesPagination}
                    onPaginationChange={handlePaginationChange}
                />
            </div>

            <AnneeUniModal
                isOpen={isAnneeUniModalOpen}
                onClose={() => setAnneeUniModalOpen(false)}
                anneeUni={itemToEdit}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={translations?.delete_annee_uni_modal_title || 'Delete Academic Year'}
                message={itemToDelete ? `Delete the year "${itemToDelete.annee}"?` : ''}
            />
        </AppLayout>
    );
}
