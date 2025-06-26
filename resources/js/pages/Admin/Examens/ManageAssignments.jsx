import ConfirmationModal from '@/components/Common/ConfirmationModal';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react'; 
import { useMemo, useState } from 'react';
import AssignmentCard from './AssignmentCard';
import Masonry from 'react-masonry-css';

export default function ManageAssignments({ examen, sallesWithAttributions, availableProfesseurs }) {
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const breadcrumbs = useMemo(
        () => [
            { title: 'Examinations', href: route('admin.examens.index') },
            { title: examen.nom || `Exam ID ${examen.id}` },
            { title: 'Manage Assignments' },
        ],
        [examen],
    );

    const handleToggleResponsable = (attributionId) => {
        router.put(route('admin.attributions.toggle-responsable', { attribution: attributionId }), {}, { preserveScroll: true });
    };

    const openDeleteAttributionModal = (attribution) => {
        setItemToDelete(attribution);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteAttribution = () => {
        if (itemToDelete) {
            router.delete(route('admin.attributions.destroy_manual', { attribution: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    const formatDate = (datetimeString) => {
        if (!datetimeString) return 'N/A';
        return new Date(datetimeString).toLocaleString();
    };

    const breakpointColumnsObj = {
      default: 3,
      1280: 2, // For xl screens
      768: 1   // For md screens and below
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage Assignments for ${examen.nom}`} />

            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Manage Assignments: {examen.nom}</h1>
                    <p className="text-sm text-muted-foreground">Module: {examen.module.nom} on {formatDate(examen.debut)}</p>
                </div>
                
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {sallesWithAttributions.map(salleData => (
                        <AssignmentCard
                            key={salleData.id}
                            salleData={salleData}
                            examen={examen}
                            availableProfesseurs={availableProfesseurs}
                            onToggleResponsable={handleToggleResponsable}
                            onDeleteAttribution={openDeleteAttributionModal}
                        />
                    ))}
                </Masonry>
            </div>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteAttribution}
                title="Delete Assignment"
                message={`Remove ${itemToDelete?.professeur?.prenom} ${itemToDelete?.professeur?.nom} from this exam?`}
            />
        </AppLayout>
    );
}
