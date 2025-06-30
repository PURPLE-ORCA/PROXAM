import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useContext, useState } from 'react';
import SesonCard from './SesonCard';
import SesonModal from './SesonModal';

export default function Index({ sesons, anneeUnis, filters }) {
    const { translations } = useContext(TranslationContext);
    const { auth } = usePage().props;

    const [modalState, setModalState] = useState({ type: null, data: null });
    const [processingAction, setProcessingAction] = useState({ type: null, id: null });

    const openModal = (type, data = null) => setModalState({ type, data });
    const closeModal = () => setModalState({ type: null, data: null });

    const handleBatchAssign = () => {
        const seson = modalState.data;
        setProcessingAction({ type: 'batch', id: seson.id });
        router.post(route('admin.sesons.batch-assign-exams', { seson: seson.id }), {}, {
            onFinish: () => { setProcessingAction({ type: null, id: null }); closeModal(); },
        });
    };

    const handleApprove = () => {
        const seson = modalState.data;
        setProcessingAction({ type: 'approve', id: seson.id });
        router.post(route('admin.sesons.approve-notifications', seson.id), {}, {
            onFinish: () => { setProcessingAction({ type: null, id: null }); closeModal(); },
        });
    };
    
    const handleDelete = () => {
        const seson = modalState.data;
        router.delete(route('admin.sesons.destroy', { seson: seson.id }), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    return (
        <AppLayout>
            <Head title="Sessions" />
            <div className="p-4 md:p-6">
                <div className="flex justify-end mb-4">
                    <Button onClick={() => openModal('editSeson')}>Add Session</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
                    {sesons.map((seson) => (
                        <SesonCard
                            key={seson.id}
                            seson={seson}
                            auth={auth}
                            onEdit={() => openModal('editSeson', seson)}
                            onDelete={() => openModal('delete', seson)}
                            onBatchAssign={() => openModal('batchAssign', seson)}
                            onApprove={() => openModal('approve', seson)}
                            processingBatchAssignment={processingAction.type === 'batch' && processingAction.id === seson.id}
                            processingApproval={processingAction.type === 'approve' && processingAction.id === seson.id}
                        />
                    ))}
                </div>
            </div>

            <SesonModal
                isOpen={modalState.type === 'editSeson'}
                onClose={closeModal}
                seson={modalState.data}
                anneeUnis={anneeUnis}
            />

            <ConfirmationModal
                isOpen={modalState.type === 'delete'}
                onClose={closeModal}
                onConfirm={handleDelete}
                title="Delete Session"
                message={`Are you sure you want to delete the session "${modalState.data?.code}"?`}
            />

            <ConfirmationModal
                isOpen={modalState.type === 'batchAssign'}
                onClose={closeModal}
                onConfirm={handleBatchAssign}
                title="Confirm Batch Assignment"
                message={`Run automatic assignments for all pending exams in session "${modalState.data?.code}"? This may take a moment.`}
                confirmText="Yes, Assign All"
            />
            
            <ConfirmationModal
                isOpen={modalState.type === 'approve'}
                onClose={closeModal}
                onConfirm={handleApprove}
                title="Confirm Approval & Notifications"
                message={`Approve assignments for session "${modalState.data?.code}" and notify all professors? This action cannot be undone.`}
                confirmText="Yes, Approve & Notify"
            />
        </AppLayout>
    );
}
