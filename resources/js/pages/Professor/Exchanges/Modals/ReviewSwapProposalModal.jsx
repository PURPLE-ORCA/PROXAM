import React, { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { TranslationContext } from '@/context/TranslationProvider';

const ReviewSwapProposalModal = ({ isOpen, onClose, echange, onAccept, onRefuse }) => {
    const [processingAccept, setProcessingAccept] = useState(false);
    const [processingRefuse, setProcessingRefuse] = useState(false);
    const { translations } = useContext(TranslationContext);

    useEffect(() => {
        if (!isOpen) {
            setProcessingAccept(false);
            setProcessingRefuse(false);
        }
    }, [isOpen]);

    const handleAccept = async () => {
        setProcessingAccept(true);
        onAccept(echange.id);
    };

    const handleRefuse = async () => {
        setProcessingRefuse(true);
        onRefuse(echange.id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{translations?.review_swap_proposal_modal_title || 'Review Exchange Proposal'}</DialogTitle>
                    <DialogDescription>
                        {translations?.review_swap_proposal_modal_description || 'Review the details of the proposed swap and decide to accept or refuse.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p>
                        <strong>{translations?.review_swap_proposal_modal_your_offered_assignment || 'Your Offered Assignment:'}</strong> <br />
                        <strong>{echange?.offered_attribution?.examen?.name}</strong> ({echange?.offered_attribution?.examen?.debut ? format(new Date(echange.offered_attribution.examen.debut), 'dd/MM/yyyy HH:mm') : (translations?.not_available_short || 'N/A')})
                    </p>
                    <p>
                        <strong>{translations?.review_swap_proposal_modal_proposed_by || 'Proposed by:'}</strong> {echange?.accepter?.user?.name} <br />
                        <strong>{translations?.review_swap_proposal_modal_their_offered_assignment || 'Their Offered Assignment:'}</strong> <br />
                        <strong>{echange?.accepted_attribution?.examen?.name}</strong> ({echange?.accepted_attribution?.examen?.debut ? format(new Date(echange.accepted_attribution.examen.debut), 'dd/MM/yyyy HH:mm') : (translations?.not_available_short || 'N/A')})
                    </p>
                    {echange?.motif && (
                        <p>
                            <strong>{translations?.review_swap_proposal_modal_requesters_motif || 'Requester\'s Motif:'}</strong> <br />
                            {echange.motif}
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processingAccept || processingRefuse}>{translations?.close_button || 'Close'}</Button>
                    <Button variant="destructive" onClick={handleRefuse} disabled={processingAccept || processingRefuse}>
                        {processingRefuse ? (translations?.review_swap_proposal_modal_refusing_button || 'Refusing...') : (translations?.refuse_button || 'Refuse')}
                    </Button>
                    <Button onClick={handleAccept} disabled={processingAccept || processingRefuse}>
                        {processingAccept ? (translations?.review_swap_proposal_modal_accepting_button || 'Accepting...') : (translations?.accept_swap_button || 'Accept Swap')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewSwapProposalModal;
