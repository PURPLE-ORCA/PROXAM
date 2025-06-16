import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import SalleForm from './SalleForm';
import { TranslationContext } from '@/context/TranslationProvider';

export default function SalleModal({ isOpen, onClose, salle }) {
    const { translations } = useContext(TranslationContext);
    const isEdit = !!salle;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: salle?.id || null,
        nom: salle?.nom || '',
        default_capacite: salle?.default_capacite || '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
            setData({
                id: salle?.id || null,
                nom: salle?.nom || '',
                default_capacite: salle?.default_capacite || '',
            });
        }
    }, [isOpen, salle]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEdit ? 'admin.salles.update' : 'admin.salles.store';
        const routeParams = isEdit ? { salle: data.id } : {};
        const submission = isEdit ? put : post;

        submission(route(routeName, routeParams), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit
                            ? translations?.edit_salle_heading || 'Edit Room'
                            : translations?.create_salle_heading || 'New Room'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? (translations?.edit_salle_desc || "Update the room's details below.")
                            : (translations?.create_salle_desc || 'Fill out the details for the new room.')}
                    </DialogDescription>
                </DialogHeader>
                <SalleForm
                    data={data}
                    setData={setData}
                    errors={errors}
                />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {translations?.cancel_button || 'Cancel'}
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={processing}>
                        {processing ? (translations?.saving_button || 'Saving...') : isEdit ? (translations?.update_button || 'Update') : (translations?.save_button || 'Save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
