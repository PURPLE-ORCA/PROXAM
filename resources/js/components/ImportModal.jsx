import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useContext } from 'react';
import { TranslationContext } from '@/context/TranslationProvider';
import { Icon } from '@iconify/react';

export default function ImportModal({ isOpen, onClose }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        professeurs_file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.professeurs.import'), {
            onSuccess: () => {
                onClose();
                reset();
            },
            onError: () => {
                // Errors are automatically handled by useForm and displayed
            },
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        reset(); // Clear form data on close
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{translations?.import_professors_modal_title || 'Import Professors'}</DialogTitle>
                    <DialogDescription>
                        Upload the official professor list (Excel or CSV). The system will automatically read the data.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p className="text-muted-foreground text-sm">
                        {translations?.import_professors_modal_instructions || 'Please ensure your file has the following headers:'}
                        <br />
                        <code className="font-mono text-xs">nom, prenom, email, Cadre, specialite, Departement, recrutement</code>
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="professeurs_file">{translations?.select_file_label || 'Select File'}</Label>
                            <Input
                                id="professeurs_file"
                                type="file"
                                onChange={(e) => setData('professeurs_file', e.target.files[0])}
                                className="file:bg-[var(--primary-foreground)] file:text-[var(--primary)] file:hover:bg-[var(--primary-foreground)]/90"
                            />
                            {errors.professeurs_file && <p className="text-sm text-red-500">{errors.professeurs_file}</p>}
                            {errors.import_error && ( // General error from controller
                                <p className="text-sm text-red-500">{errors.import_error}</p>
                            )}
                        </div>
                        <Button type="submit" disabled={processing || !data.professeurs_file}>
                            {processing ? (
                                <>
                                    <Icon icon="mdi:loading" className="mr-2 h-4 w-4 animate-spin" />
                                    {translations?.uploading_button || 'Uploading...'}
                                </>
                            ) : (
                                translations?.upload_and_import_button || 'Upload and Import'
                            )}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
