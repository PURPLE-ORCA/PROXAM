import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FiliereForm({ data, setData, errors }) {
    return (
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="nom">Field Name</Label>
                <Input
                    id="nom"
                    value={data.nom}
                    onChange={(e) => setData('nom', e.target.value)}
                    required
                    className="w-full"
                />
                {errors.nom && <p className="mt-1 text-sm text-destructive">{errors.nom}</p>}
            </div>
        </div>
    );
}
