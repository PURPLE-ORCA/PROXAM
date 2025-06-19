import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TranslationContext } from '@/context/TranslationProvider';
import { useContext } from 'react';

export default function SalleForm({ data, setData, errors }) {
    const { translations } = useContext(TranslationContext);

    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom" className="text-right">
                    {translations?.salle_form_name_label || 'Name'}
                </Label>
                <div className="col-span-3">
                    <Input
                        id="nom"
                        value={data.nom}
                        onChange={(e) => setData('nom', e.target.value)}
                        className="w-full"
                    />
                    {errors.nom && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.nom}</p>}
                </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="default_capacite" className="text-right">
                    {translations?.salle_form_capacity_label || 'Capacity'}
                </Label>
                <div className="col-span-3">
                    <Input
                        id="default_capacite"
                        type="number"
                        min="1"
                        value={data.default_capacite}
                        onChange={(e) => setData('default_capacite', parseInt(e.target.value, 10) || '')}
                        className="w-full"
                    />
                    {errors.default_capacite && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.default_capacite}</p>}
                </div>
            </div>
        </div>
    );
}
