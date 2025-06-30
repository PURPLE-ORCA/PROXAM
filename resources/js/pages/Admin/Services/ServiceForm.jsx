import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TranslationContext } from '@/context/TranslationProvider';
import { useContext } from 'react';

// The form is now dumber, which is smarter. It just displays fields and reports changes.
export default function ServiceForm({ data, setData, errors }) {
    const { translations } = useContext(TranslationContext);

    return (
        <form id="service-form">
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nom" className="text-right">
                        {translations?.service_form_name_label || 'Name'}
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
            </div>
        </form>
    );
}
