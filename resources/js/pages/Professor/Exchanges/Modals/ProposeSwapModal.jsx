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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { TranslationContext } from '@/context/TranslationProvider';

const ProposeSwapModal = ({ isOpen, onClose, echange, swappableAssignments, onSubmit }) => {
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [processing, setProcessing] = useState(false);
    const { translations } = useContext(TranslationContext);

    useEffect(() => {
        if (!isOpen) {
            setSelectedAssignment('');
            setProcessing(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!selectedAssignment) {
            toast.error(translations?.toasts_please_select_assignment_to_propose || 'Please select an assignment to propose.');
            return;
        }
        setProcessing(true);
        onSubmit(echange.id, selectedAssignment);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{translations?.propose_swap_modal_title || 'Propose a Swap for'} "{echange?.offered_attribution?.examen?.name}"</DialogTitle>
                    <DialogDescription>
                        {translations?.propose_swap_modal_description || 'Select one of your assignments to propose as a swap for this exam duty.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="assignment" className="text-right">
                            {translations?.propose_swap_modal_your_assignment_label || 'Your Assignment'}
                        </Label>
                        <Select onValueChange={setSelectedAssignment} value={selectedAssignment}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={translations?.propose_swap_modal_select_assignment_placeholder || 'Select an assignment'} />
                            </SelectTrigger>
                            <SelectContent>
                                {swappableAssignments.map((assignment) => (
                                    <SelectItem key={assignment.id} value={assignment.id}>
                                        {assignment.examen.name} ({format(new Date(assignment.examen.debut), 'dd/MM/yyyy HH:mm')})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>{translations?.cancel_button || 'Cancel'}</Button>
                    <Button onClick={handleSubmit} disabled={processing}>
                        {processing ? (translations?.propose_swap_modal_proposing_button || 'Proposing...') : (translations?.propose_swap_modal_propose_button || 'Propose Swap')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ProposeSwapModal;
