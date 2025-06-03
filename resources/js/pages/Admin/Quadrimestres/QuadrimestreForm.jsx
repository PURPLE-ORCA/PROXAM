import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslationContext } from '@/context/TranslationProvider';
import { Link } from '@inertiajs/react';
import { useContext } from 'react';

export default function QuadrimestreForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    sesons, // This prop will receive the list of Seson (with display_name)
    isEdit = false,
}) {
    const { translations } = useContext(TranslationContext);

    return (
        <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                    <Label htmlFor="seson_id" className="text-[var(--foreground)]">
                        {translations?.quadrimestre_form_seson_label || 'Session'} *
                    </Label>
                    <div className="mt-1">
                        <Select
                            value={data.seson_id?.toString() || ''}
                            onValueChange={(value) => setData('seson_id', value ? parseInt(value, 10) : '')}
                            disabled={processing}
                            required
                        >
                            <SelectTrigger className="w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]">
                                <SelectValue placeholder={translations?.quadrimestre_form_select_seson_placeholder || 'Select a Session'} />
                            </SelectTrigger>
                            <SelectContent className="border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]">
                                {(sesons || []).map((seson) => (
                                    <SelectItem key={seson.id} value={seson.id.toString()}>
                                        {seson.display_name} {/* Uses display_name from controller */}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {errors.seson_id && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.seson_id}</p>}
                </div>

                <div className="sm:col-span-1">
                    <Label htmlFor="code" className="text-[var(--foreground)]">
                        {translations?.quadrimestre_form_code_label || 'Semester Code (e.g., Q1, Spring)'} *
                    </Label>
                    <div className="mt-1">
                        <Input
                            type="text"
                            name="code"
                            id="code"
                            required
                            className="block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            isInvalid={errors.code}
                        />
                    </div>
                    {errors.code && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.code}</p>}
                </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-[var(--border)] pt-6">
                <Button variant="outline" type="button" asChild>
                    <Link href={route('admin.quadrimestres.index')}>{translations?.cancel_button || 'Annuler'}</Link>
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
