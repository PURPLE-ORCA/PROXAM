import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslationContext } from '@/context/TranslationProvider';
import { useContext } from 'react';

export default function QuadrimestreForm({ data, setData, errors, sesons }) {
    const { translations } = useContext(TranslationContext);

    return (
        <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 grid grid-cols-4 items-center gap-4">
                <Label htmlFor="seson_id" className="text-right">
                    {translations?.quadrimestre_form_seson_label || 'Session'}
                </Label>
                <div className="col-span-3">
                    <Select
                        value={data.seson_id?.toString() || ''}
                        onValueChange={(value) => setData('seson_id', value ? parseInt(value, 10) : '')}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={translations?.quadrimestre_form_select_seson_placeholder || 'Select a Session'} />
                        </SelectTrigger>
                        <SelectContent>
                            {(sesons || []).map((seson) => (
                                <SelectItem key={seson.id} value={seson.id.toString()}>
                                    {seson.display_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.seson_id && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.seson_id}</p>}
                </div>
            </div>
            <div className="col-span-2 grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                    {translations?.quadrimestre_form_code_label || 'Code'}
                </Label>
                <div className="col-span-3">
                     <Input
                        id="code"
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value)}
                        className="w-full"
                    />
                    {errors.code && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.code}</p>}
                </div>
            </div>
        </div>
    );
}
