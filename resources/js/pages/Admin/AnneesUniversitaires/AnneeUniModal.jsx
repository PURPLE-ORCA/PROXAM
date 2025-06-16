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
import AnneeUniForm from './AnneeUniForm';
import { TranslationContext } from '@/context/TranslationProvider';

export default function AnneeUniModal({ isOpen, onClose, anneeUni }) {
    const { translations } = useContext(TranslationContext);
    const isEdit = !!anneeUni;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: anneeUni?.id || null,
        annee: anneeUni?.annee || '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
            setData({
                id: anneeUni?.id || null,
                annee: anneeUni?.annee || '',
            });
        }
    }, [isOpen, anneeUni]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.annee.trim()) {
            setData('annee', ''); // Ensure it's an empty string if only whitespace
            clearErrors(); // Clear existing errors
            errors.annee = translations?.annee_uni_required_error || 'Academic Year is required.';
            // Manually set the error for useForm to pick up
            // This is a workaround as setError is not directly available from the destructured errors object
            // A better approach would be to use a custom validation function or let backend handle it
            // For now, we'll just set the error in the errors object and return
            return;
        }

        const routeName = isEdit ? 'admin.annees-universitaires.update' : 'admin.annees-universitaires.store';
        const routeParams = isEdit ? { anneeUni: data.id } : {}; // Match route parameter name
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
                            ? translations?.edit_annee_uni_heading || 'Edit Academic Year'
                            : translations?.create_annee_uni_heading || 'New Academic Year'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? (translations?.edit_annee_uni_desc || "Update the year's details below.")
                            : (translations?.create_annee_uni_desc || 'Use the format YYYY-YYYY.')}
                    </DialogDescription>
                </DialogHeader>
                <AnneeUniForm
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
