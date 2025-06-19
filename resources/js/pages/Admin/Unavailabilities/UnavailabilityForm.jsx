import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function UnavailabilityForm({ data, setData, errors, professeurs, anneeUnis, isEdit }) {
    return (
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="professeur_id">Professor</Label>
                <Select
                    value={data.professeur_id?.toString() || ''}
                    onValueChange={(value) => setData('professeur_id', value)}
                    disabled={isEdit}
                    required
                >
                    <SelectTrigger><SelectValue placeholder="Select Professor" /></SelectTrigger>
                    <SelectContent>
                        {(professeurs || []).map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.display_name}</SelectItem>)}
                    </SelectContent>
                </Select>
                {errors.professeur_id && <p className="text-sm text-destructive">{errors.professeur_id}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="annee_uni_id">Academic Year</Label>
                <Select
                    value={data.annee_uni_id?.toString() || ''}
                    onValueChange={(value) => setData('annee_uni_id', value)}
                    required
                >
                    <SelectTrigger><SelectValue placeholder="Select Academic Year" /></SelectTrigger>
                    <SelectContent>
                        {(anneeUnis || []).map((year) => <SelectItem key={year.id} value={year.id.toString()}>{year.annee}</SelectItem>)}
                    </SelectContent>
                </Select>
                {errors.annee_uni_id && <p className="text-sm text-destructive">{errors.annee_uni_id}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_datetime">Start Time</Label>
                    <Input id="start_datetime" type="datetime-local" value={data.start_datetime} onChange={e => setData('start_datetime', e.target.value)} required />
                    {errors.start_datetime && <p className="text-sm text-destructive">{errors.start_datetime}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end_datetime">End Time</Label>
                    <Input id="end_datetime" type="datetime-local" value={data.end_datetime} onChange={e => setData('end_datetime', e.target.value)} required />
                    {errors.end_datetime && <p className="text-sm text-destructive">{errors.end_datetime}</p>}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea id="reason" value={data.reason} onChange={e => setData('reason', e.target.value)} />
                {errors.reason && <p className="text-sm text-destructive">{errors.reason}</p>}
            </div>
        </div>
    );
}
