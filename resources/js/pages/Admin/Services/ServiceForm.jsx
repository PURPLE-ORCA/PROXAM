import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TranslationContext } from '@/context/TranslationProvider';
import { Link } from '@inertiajs/react';
import { useContext } from 'react';

export default function ServiceForm({ data, setData, errors, processing, onSubmit, isEdit = false }) {
    const { translations } = useContext(TranslationContext);

    return (
        <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6">
                <div className="sm:col-span-full">
                    <Label htmlFor="nom" className="text-[var(--foreground)]">
                        {translations?.service_form_name_label || 'Nom du Service'} *
                    </Label>
                    <div className="mt-1">
                        <Input
                            type="text"
                            name="nom"
                            id="nom"
                            required
                            className="block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                            value={data.nom}
                            onChange={(e) => setData('nom', e.target.value)}
                            isInvalid={errors.nom} // Assuming your Shadcn Input can take this prop for styling
                        />
                    </div>
                    {errors.nom && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.nom}</p>}
                </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-[var(--border)] pt-6">
                <Button variant="outline" type="button" asChild>
                    <Link href={route('admin.services.index')}>{translations?.cancel_button || 'Annuler'}</Link>
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
                >
                    {processing
                        ? translations?.saving_button || 'Enregistrement...'
                        : isEdit
                          ? translations?.update_button || 'Mettre à Jour'
                          : translations?.save_button || 'Enregistrer'}
                </Button>
            </div>
        </form>
    );
}
