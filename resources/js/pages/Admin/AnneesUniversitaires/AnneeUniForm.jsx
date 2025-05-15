import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TranslationContext } from '@/context/TranslationProvider';
import { Link } from '@inertiajs/react';
import { useContext } from 'react';

export default function AnneeUniForm({ data, setData, errors, processing, onSubmit, isEdit = false }) {
    const { translations } = useContext(TranslationContext);

    return (
        <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6">
                <div className="sm:col-span-full">
                    <Label htmlFor="annee" className="text-[var(--foreground)]">
                        {translations?.annee_uni_form_year_label || 'Academic Year (e.g., 2024-2025)'} *
                    </Label>
                    <div className="mt-1">
                        <Input
                            type="text"
                            name="annee"
                            id="annee"
                            required
                            placeholder="YYYY-YYYY"
                            className="block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                            value={data.annee}
                            onChange={(e) => setData('annee', e.target.value)}
                            isInvalid={errors.annee}
                        />
                    </div>
                    {errors.annee && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.annee}</p>}
                </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-[var(--border)] pt-6">
                <Button variant="outline" type="button" asChild>
                    <Link href={route('admin.annees-universitaires.index')}>{translations?.cancel_button || 'Annuler'}</Link>
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
