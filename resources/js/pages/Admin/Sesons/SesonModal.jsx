import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import SesonForm from './SesonForm';
import { TranslationContext } from '@/context/TranslationProvider';

export default function SesonModal({ isOpen, onClose, seson, anneeUnis }) {
    const { translations } = useContext(TranslationContext);
    const isEdit = !!seson;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: seson?.id || null,
        code: seson?.code || '',
        annee_uni_id: seson?.annee_uni_id || '',
    });

    useEffect(() => {
        if (isOpen) {
            reset(); clearErrors();
            setData({
                id: seson?.id || null,
                code: seson?.code || '',
                annee_uni_id: seson?.annee_uni_id || '',
            });
        }
    }, [isOpen, seson]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEdit ? 'admin.sesons.update' : 'admin.sesons.store';
        const routeParams = isEdit ? { seson: data.id } : {};
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
                    <DialogTitle>{isEdit ? 'Edit Session' : 'New Session'}</DialogTitle>
                </DialogHeader>
                <SesonForm data={data} setData={setData} errors={errors} anneeUnis={anneeUnis} />
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
