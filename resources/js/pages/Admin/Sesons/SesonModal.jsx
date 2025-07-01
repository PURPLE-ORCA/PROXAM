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
        rank_quotas: null, // Initialize as null for new sessions
    });

    useEffect(() => {
        if (isOpen) {
            reset(); clearErrors();
            setData({
                id: seson?.id || null,
                code: seson?.code || '',
                annee_uni_id: seson?.annee_uni_id || '',
                rank_quotas: seson?.rank_quotas || { PA: 6, PAG: 4, PES: 2 }, // Populate with defaults if not set
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
                    <DialogTitle>{isEdit ? translations?.seson_modal_edit_title : translations?.seson_modal_new_title}</DialogTitle>
                </DialogHeader>
                <SesonForm data={data} setData={setData} errors={errors} anneeUnis={anneeUnis} />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>{translations?.cancel_button}</Button>
                    <Button type="button" onClick={handleSubmit} disabled={processing}>
                        {processing ? translations?.saving_button : translations?.save_button}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
