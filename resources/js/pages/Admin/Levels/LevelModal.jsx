import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import LevelForm from './LevelForm';

export default function LevelModal({ isOpen, onClose, level, filieres, currentFiliereId }) {
    const isEdit = !!level;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: null,
        nom: '',
        filiere_id: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
            setData({
                id: level?.id || null,
                nom: level?.nom || '',
                filiere_id: level?.filiere_id?.toString() || currentFiliereId?.toString() || '',
            });
        }
    }, [isOpen, level, currentFiliereId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEdit ? 'admin.levels.update' : 'admin.levels.store';
        const routeParams = isEdit ? { level: data.id } : {};
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
                    <DialogTitle>{isEdit ? 'Edit Level' : 'New Level'}</DialogTitle>
                </DialogHeader>
                <LevelForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    filieres={filieres}
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
