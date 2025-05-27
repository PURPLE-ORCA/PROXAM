import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea'; // For reason field
import { TranslationContext } from '@/context/TranslationProvider';
import { Link } from '@inertiajs/react';
import { useContext } from 'react';

export default function UnavailabilityForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    professeurs,
    anneeUnis, // Add anneeUnis to props
    isEdit = false,
}) {
    const { translations } = useContext(TranslationContext);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <Label htmlFor="professeur_id" className="text-[var(--foreground)]">
                    {translations?.unavailability_form_professeur_label || 'Professor'} *
                </Label>
                <Select
                    value={data.professeur_id?.toString() || ''}
                    onValueChange={(value) => setData('professeur_id', value ? parseInt(value, 10) : '')}
                    disabled={processing || isEdit}
                    required
                >
                    <SelectTrigger className="mt-1 w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]">
                        <SelectValue placeholder={translations?.unavailability_form_select_professeur_placeholder || 'Select Professor'} />
                    </SelectTrigger>
                    <SelectContent className="border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]">
                        {(professeurs || []).map((prof) => (
                            <SelectItem key={prof.id} value={prof.id.toString()}>
                                {prof.display_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.professeur_id && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.professeur_id}</p>}
            </div>

            {/* New Academic Year Select Field */}
            <div>
                <Label htmlFor="annee_uni_id" className="text-[var(--foreground)]">
                    {translations?.unavailability_form_academic_year_label || 'Academic Year'} *
                </Label>
                <Select
                    value={data.annee_uni_id?.toString() || ''}
                    onValueChange={(value) => setData('annee_uni_id', value ? parseInt(value, 10) : '')}
                    disabled={processing}
                    required
                >
                    <SelectTrigger className="mt-1 w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]">
                        <SelectValue placeholder={translations?.unavailability_form_select_academic_year_placeholder || 'Select Academic Year'} />
                    </SelectTrigger>
                    <SelectContent className="border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]">
                        {(anneeUnis || []).map((annee) => (
                            <SelectItem key={annee.id} value={annee.id.toString()}>
                                {annee.annee}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.annee_uni_id && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.annee_uni_id}</p>}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <Label htmlFor="start_datetime" className="text-[var(--foreground)]">
                        {translations?.unavailability_form_start_datetime_label || 'Start Date & Time'} *
                    </Label>
                    <Input
                        id="start_datetime"
                        type="datetime-local"
                        value={data.start_datetime || ''}
                        onChange={(e) => setData('start_datetime', e.target.value)}
                        required
                        className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                        isInvalid={errors.start_datetime}
                    />
                    {errors.start_datetime && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.start_datetime}</p>}
                </div>
                <div>
                    <Label htmlFor="end_datetime" className="text-[var(--foreground)]">
                        {translations?.unavailability_form_end_datetime_label || 'End Date & Time'} *
                    </Label>
                    <Input
                        id="end_datetime"
                        type="datetime-local"
                        value={data.end_datetime || ''}
                        onChange={(e) => setData('end_datetime', e.target.value)}
                        required
                        className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                        isInvalid={errors.end_datetime}
                    />
                    {errors.end_datetime && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.end_datetime}</p>}
                </div>
            </div>

            <div>
                <Label htmlFor="reason" className="text-[var(--foreground)]">
                    {translations?.unavailability_form_reason_label || 'Reason (Optional)'}
                </Label>
                <Textarea
                    id="reason"
                    value={data.reason || ''}
                    onChange={(e) => setData('reason', e.target.value)}
                    className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                    rows={3}
                    isInvalid={errors.reason}
                />
                {errors.reason && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.reason}</p>}
            </div>

            <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-[var(--border)] pt-6">
                <Button variant="outline" type="button" asChild>
                    <Link href={route('admin.unavailabilities.index')}>{translations?.cancel_button || 'Annuler'}</Link>
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
                >
                    {processing
                        ? translations?.saving_button || 'Enregistrement...'
                        : isEdit
                          ? translations?.update_button || 'Mettre à Jour'
                          : translations?.save_button || 'Enregistrer'}
                </Button>
            </div>
        </form>
    );
}
