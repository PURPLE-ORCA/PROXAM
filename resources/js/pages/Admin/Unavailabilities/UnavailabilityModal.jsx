import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import UnavailabilityForm from './UnavailabilityForm';

const formatDatetimeForInput = (datetimeString) => {
    if (!datetimeString) return '';
    try {
        const date = new Date(datetimeString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    } catch (e) { return ''; }
};

export default function UnavailabilityModal({ isOpen, onClose, unavailability, professeurs, anneeUnis }) {
    const isEdit = !!unavailability;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: null,
        professeur_id: '',
        annee_uni_id: '',
        start_datetime: '',
        end_datetime: '',
        reason: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
            setData({
                id: unavailability?.id || null,
                professeur_id: unavailability?.professeur_id?.toString() || '',
                annee_uni_id: unavailability?.annee_uni_id?.toString() || '',
                start_datetime: formatDatetimeForInput(unavailability?.start_datetime),
                end_datetime: formatDatetimeForInput(unavailability?.end_datetime),
                reason: unavailability?.reason || '',
            });
        }
    }, [isOpen, unavailability]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEdit ? 'admin.unavailabilities.update' : 'admin.unavailabilities.store';
        const routeParams = isEdit ? { unavailability: data.id } : {};
        const submission = isEdit ? put : post;

        submission(route(routeName, routeParams), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Unavailability' : 'New Unavailability'}</DialogTitle>
                </DialogHeader>
                <UnavailabilityForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    professeurs={professeurs}
                    anneeUnis={anneeUnis}
                    isEdit={isEdit}
                />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleSubmit} disabled={processing}>
                        {processing ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
