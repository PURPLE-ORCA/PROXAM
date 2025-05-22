import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TranslationContext } from '@/context/TranslationProvider';
import { Link } from '@inertiajs/react';
import { useContext } from 'react';

export default function FiliereForm({ data, setData, errors, processing, onSubmit, isEdit = false }) {
    const { translations } = useContext(TranslationContext);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <Label htmlFor="nom" className="text-[var(--foreground)]">
                    {translations?.filiere_form_name_label || 'Field Name'} *
                </Label>
                <Input
                    id="nom"
                    type="text"
                    value={data.nom}
                    onChange={(e) => setData('nom', e.target.value)}
                    required
                    className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                    isInvalid={errors.nom}
                />
                {errors.nom && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.nom}</p>}
            </div>

            <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-[var(--border)] pt-6">
                <Button variant="outline" type="button" asChild>
                    <Link href={route('admin.filieres.index')}>{translations?.cancel_button || 'Annuler'}</Link>
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
                >
                    {processing
                        ? translations?.saving_button || 'Saving...'
                        : isEdit
                          ? translations?.update_button || 'Update'
                          : translations?.save_button || 'Save'}
                </Button>
            </div>
        </form>
    );
}
