import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContext } from 'react';
import { TranslationContext } from '@/context/TranslationProvider';

export default function SesonForm({ data, setData, errors, anneeUnis }) {
    const { translations } = useContext(TranslationContext);
    return (
        <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 grid grid-cols-4 items-center gap-4">
                <Label htmlFor="annee_uni_id" className="text-right">{translations?.seson_form_academic_year_label}</Label>
                <div className="col-span-3">
                    <Select value={data.annee_uni_id?.toString() || ''} onValueChange={(value) => setData('annee_uni_id', value)}>
                        <SelectTrigger><SelectValue placeholder={translations?.seson_form_select_year_placeholder} /></SelectTrigger>
                        <SelectContent>
                            {(anneeUnis || []).map((year) => (
                                <SelectItem key={year.id} value={year.id.toString()}>{year.annee}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.annee_uni_id && <p className="mt-1 text-sm text-destructive">{errors.annee_uni_id}</p>}
                </div>
            </div>
            <div className="col-span-2 grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">{translations?.seson_form_session_code_label}</Label>
                <div className="col-span-3">
                     <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder={translations?.seson_form_code_placeholder} />
                    {errors.code && <p className="mt-1 text-sm text-destructive">{errors.code}</p>}
                </div>
            </div>
        </div>
    );
}
