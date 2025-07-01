import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContext } from 'react';
import { TranslationContext } from '@/context/TranslationProvider';

export default function SesonForm({ data, setData, errors, anneeUnis }) {
    const { translations } = useContext(TranslationContext);
    return (
        <div className="space-y-6">
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

            {/* --- ADD THIS NEW FIELDSET --- */}
            <fieldset className="space-y-4 rounded-md border p-4">
                <legend className="px-1 text-sm font-semibold">Assignment Quotas</legend>
                <p className="text-sm text-muted-foreground">
                    Set the maximum number of assignments per professor rank for this session.
                </p>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="quota_pa">Prof. Assistant (PA)</Label>
                        <Input
                            id="quota_pa"
                            type="number"
                            value={data.rank_quotas?.PA ?? 6} // Default to 6 if not set
                            onChange={(e) => setData('rank_quotas', { ...data.rank_quotas, PA: parseInt(e.target.value) || 0 })}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="quota_pag">Prof. Agrégé (PAG)</Label>
                        <Input
                            id="quota_pag"
                            type="number"
                            value={data.rank_quotas?.PAG ?? 4} // Default to 4
                            onChange={(e) => setData('rank_quotas', { ...data.rank_quotas, PAG: parseInt(e.target.value) || 0 })}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="quota_pes">Prof. Ens. Supérieur (PES)</Label>
                        <Input
                            id="quota_pes"
                            type="number"
                            value={data.rank_quotas?.PES ?? 2} // Default to 2
                            onChange={(e) => setData('rank_quotas', { ...data.rank_quotas, PES: parseInt(e.target.value) || 0 })}
                            className="mt-1"
                        />
                    </div>
                </div>
                {errors.rank_quotas && <p className="mt-2 text-sm text-destructive">{errors.rank_quotas}</p>}
            </fieldset>
        </div>
    );
}
