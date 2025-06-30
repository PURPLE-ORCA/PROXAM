import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LevelForm({ data, setData, errors, filieres, isEdit }) {
    return (
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="filiere_id">Study Field</Label>
                <Select
                    value={data.filiere_id?.toString() || ''}
                    onValueChange={(value) => setData('filiere_id', value)}
                    disabled={isEdit} // Don't allow changing the parent field on edit
                    required
                >
                    <SelectTrigger><SelectValue placeholder="Select Study Field" /></SelectTrigger>
                    <SelectContent>
                        {(filieres || []).map((filiere) => (
                            <SelectItem key={filiere.id} value={filiere.id.toString()}>{filiere.nom}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.filiere_id && <p className="mt-1 text-sm text-destructive">{errors.filiere_id}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="nom">Level Name</Label>
                <Input
                    id="nom"
                    value={data.nom}
                    onChange={(e) => setData('nom', e.target.value)}
                    required
                />
                {errors.nom && <p className="mt-1 text-sm text-destructive">{errors.nom}</p>}
            </div>
        </div>
    );
}
