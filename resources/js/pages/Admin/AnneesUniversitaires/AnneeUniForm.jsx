import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TranslationContext } from '@/context/TranslationProvider';
import { useContext } from 'react';

export default function AnneeUniForm({ data, setData, errors }) {
    const { translations } = useContext(TranslationContext);

    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="annee" className="text-right">
                    {translations?.annee_uni_form_year_label || 'Year'}
                </Label>
                <div className="col-span-3">
                    <Input
                        id="annee"
                        value={data.annee}
                        placeholder="e.g., 2024-2025"
                        onChange={(e) => setData('annee', e.target.value)}
                        className="w-full"
                    />
                    {errors.annee && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.annee}</p>}
                </div>
            </div>
        </div>
    );
}
