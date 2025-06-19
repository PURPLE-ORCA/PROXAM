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
import ServiceForm from './ServiceForm';
import { TranslationContext } from '@/context/TranslationProvider';

export default function ServiceModal({ isOpen, onClose, service }) {
    const { translations } = useContext(TranslationContext);
    const isEdit = !!service;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: service?.id || null,
        nom: service?.nom || '',
    });

    // This effect resets the form whenever the modal is opened for a new purpose
    useEffect(() => {
        if (isOpen) {
            reset(); // Clear form state
            clearErrors(); // Clear validation errors
            setData({
                id: service?.id || null,
                nom: service?.nom || '',
            });
        }
    }, [isOpen, service]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEdit ? 'admin.services.update' : 'admin.services.store';
        const routeParams = isEdit ? { service: data.id } : {};
        const submission = isEdit ? put : post;

        submission(route(routeName, routeParams), {
            preserveScroll: true,
            onSuccess: () => onClose(), // Close the modal on success
            onError: () => {
                // Errors are automatically handled by the useForm hook
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit
                            ? translations?.edit_service_heading || 'Edit Service'
                            : translations?.create_service_heading || 'New Service'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? (translations?.edit_service_desc || "Update the service's details below.")
                            : (translations?.create_service_desc || 'Fill out the details for the new service.')}
                    </DialogDescription>
                </DialogHeader>
                {/* The form itself has no buttons */}
                <ServiceForm
                    data={data}
                    setData={setData}
                    errors={errors}
                />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        {translations?.cancel_button || 'Cancel'}
                    </Button>
                    {/* The submit button is now here, and triggers the form's submit event */}
                    <Button type="button" onClick={handleSubmit} disabled={processing}>
                        {processing ? 'Saving...' : isEdit ? translations?.update_button || 'Update' : translations?.save_button || 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
