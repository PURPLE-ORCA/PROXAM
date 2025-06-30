import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import FiliereForm from './FiliereForm';

export default function FiliereModal({ isOpen, onClose, filiere }) {
    const isEdit = !!filiere;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: filiere?.id || null,
        nom: filiere?.nom || '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
            setData({
                id: filiere?.id || null,
                nom: filiere?.nom || '',
            });
        }
    }, [isOpen, filiere]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEdit ? 'admin.filieres.update' : 'admin.filieres.store';
        const routeParams = isEdit ? { filiere: data.id } : {};
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
                    <DialogTitle>{isEdit ? 'Edit Study Field' : 'New Study Field'}</DialogTitle>
                </DialogHeader>
                <FiliereForm
                    data={data}
                    setData={setData}
                    errors={errors}
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
