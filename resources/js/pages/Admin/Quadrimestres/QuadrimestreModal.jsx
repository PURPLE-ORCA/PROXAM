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
import QuadrimestreForm from './QuadrimestreForm';
import { TranslationContext } from '@/context/TranslationProvider';

export default function QuadrimestreModal({ isOpen, onClose, quadrimestre, sesons }) {
    const { translations } = useContext(TranslationContext);
    const isEdit = !!quadrimestre;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: quadrimestre?.id || null,
        code: quadrimestre?.code || '',
        seson_id: quadrimestre?.seson_id || '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
            setData({
                id: quadrimestre?.id || null,
                code: quadrimestre?.code || '',
                seson_id: quadrimestre?.seson_id || '',
            });
        }
    }, [isOpen, quadrimestre]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEdit ? 'admin.quadrimestres.update' : 'admin.quadrimestres.store';
        const routeParams = isEdit ? { quadrimestre: data.id } : {};
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
                            ? translations?.edit_quadrimestre_heading || 'Edit Semester'
                            : translations?.create_quadrimestre_heading || 'New Semester'}
                    </DialogTitle>
                     <DialogDescription>
                        {isEdit
                            ? (translations?.edit_quadrimestre_desc || "Update the semester's details below.")
                            : (translations?.create_quadrimestre_desc || 'Fill out the details for the new semester.')}
                    </DialogDescription>
                </DialogHeader>
                <QuadrimestreForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    sesons={sesons}
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
