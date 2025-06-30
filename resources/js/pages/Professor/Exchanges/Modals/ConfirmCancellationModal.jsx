import React, { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { TranslationContext } from '@/context/TranslationProvider';

const ConfirmCancellationModal = ({ isOpen, onClose, echange, onSubmit }) => {
    const [processing, setProcessing] = useState(false);
    const { translations } = useContext(TranslationContext);

    useEffect(() => {
        if (!isOpen) {
            setProcessing(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setProcessing(true);
        onSubmit(echange.id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{translations?.confirm_cancellation_modal_title || 'Confirm Cancellation'}</DialogTitle>
                    <DialogDescription>
                        {translations?.confirm_cancellation_modal_description || 'Are you sure you want to cancel your exchange request for'} "{echange?.offered_attribution?.examen?.name}"?
                        {translations?.confirm_cancellation_modal_undone_action || 'This action cannot be undone.'}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>{translations?.confirm_cancellation_modal_keep_button || 'No, Keep It'}</Button>
                    <Button variant="destructive" onClick={handleSubmit} disabled={processing}>
                        {processing ? (translations?.confirm_cancellation_modal_cancelling_button || 'Cancelling...') : (translations?.confirm_cancellation_modal_cancel_button || 'Yes, Cancel Request')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmCancellationModal;
