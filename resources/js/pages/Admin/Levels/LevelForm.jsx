import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslationContext } from '@/context/TranslationProvider';
import { Link } from '@inertiajs/react'; // Added usePage for current filiere if on specific page
import React, { useContext } from 'react';

export default function LevelForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    filieres, // Array of { id, nom } for the dropdown
    currentFiliereId = null, // Optional: if creating from a specific filiere's page
    isEdit = false,
}) {
    const { translations } = useContext(TranslationContext);

    // Pre-select filiere_id if currentFiliereId is provided and not editing an existing level
    // (for edit, data.filiere_id will be set from the level's existing data)
    React.useEffect(() => {
        if (currentFiliereId && !isEdit && !data.filiere_id) {
            setData('filiere_id', currentFiliereId.toString());
        }
    }, [currentFiliereId, isEdit, setData, data.filiere_id]);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <Label htmlFor="filiere_id" className="text-[var(--foreground)]">
                    {translations?.level_form_filiere_label || 'Study Field'} *
                </Label>
                <Select
                    value={data.filiere_id?.toString() || ''}
                    onValueChange={(value) => setData('filiere_id', value ? parseInt(value, 10) : '')}
                    disabled={processing || (isEdit && data.filiere_id)} // Usually don't change filiere of existing level
                    required
                >
                    <SelectTrigger className="mt-1 w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]">
                        <SelectValue placeholder={translations?.level_form_select_filiere_placeholder || 'Select Study Field'} />
                    </SelectTrigger>
                    <SelectContent className="border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]">
                        {(filieres || []).map((filiere) => (
                            <SelectItem key={filiere.id} value={filiere.id.toString()}>
                                {filiere.nom}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.filiere_id && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.filiere_id}</p>}
            </div>

            <div>
                <Label htmlFor="nom" className="text-[var(--foreground)]">
                    {translations?.level_form_name_label || 'Level Name (e.g., 1st Year)'} *
                </Label>
                <Input
                    id="nom"
                    type="text"
                    value={data.nom}
                    onChange={(e) => setData('nom', e.target.value)}
                    required
                    className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                    isInvalid={errors.nom}
                />
                {errors.nom && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.nom}</p>}
            </div>

            <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-[var(--border)] pt-6">
                <Button variant="outline" type="button" asChild>
                    {/* Redirect back to the specific filiere's levels page if currentFiliereId is known */}
                    <Link href={currentFiliereId ? route('admin.levels.index', { filiere: currentFiliereId }) : route('admin.filieres.index')}>
                        {translations?.cancel_button || 'Annuler'}
                    </Link>
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
                >
                    {processing
                        ? translations?.saving_button || 'Saving...'
                        : isEdit
                          ? translations?.update_button || 'Update'
                          : translations?.save_button || 'Save'}
                </Button>
            </div>
        </form>
    );
}
