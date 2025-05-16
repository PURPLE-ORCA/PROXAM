import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'; // Shadcn Checkbox
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslationContext } from '@/context/TranslationProvider';
import { Link } from '@inertiajs/react';
import { useContext, useEffect } from 'react';

export default function ProfesseurForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    services,
    modules,
    rangs, 
    statuts,
    specialties,
    isEdit = false,
    professeurToEdit, 
}) {
    const { translations } = useContext(TranslationContext);
    const specialiteOptions = {
        chirurgical: translations?.professeur_specialty_chirurgical || 'Chirurgical',
        medical: translations?.professeur_specialty_medical || 'Médical',
    };
    // Handle module_ids selection (array of selected module IDs)
    const handleModuleChange = (moduleId) => {
        const currentModules = data.module_ids || [];
        if (currentModules.includes(moduleId)) {
            setData(
                'module_ids',
                currentModules.filter((id) => id !== moduleId),
            );
        } else {
            setData('module_ids', [...currentModules, moduleId]);
        }
    };

    useEffect(() => {
        if (isEdit && professeurToEdit && professeurToEdit.modules) {
            setData(
                'module_ids',
                professeurToEdit.modules.map((m) => m.id),
            );
        }
    }, [professeurToEdit, isEdit, setData]);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <fieldset className="grid grid-cols-1 gap-x-6 gap-y-6 rounded-md border border-[var(--border)] p-4 sm:grid-cols-6">
                <legend className="px-1 text-sm leading-6 font-semibold text-[var(--foreground)]">
                    {translations?.professeur_form_user_section_legend || 'User Account Details'}
                </legend>
                <div className="sm:col-span-3">
                    <Label htmlFor="professeur_prenom" className="text-[var(--foreground)]">
                        {translations?.professeur_form_first_name_label || 'First Name'} *
                    </Label>
                    <Input
                        id="professeur_prenom"
                        type="text"
                        value={data.professeur_prenom}
                        onChange={(e) => setData('professeur_prenom', e.target.value)}
                        required
                        className="mt-1"
                    />
                    {errors.professeur_prenom && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.professeur_prenom}</p>}
                </div>
                <div className="sm:col-span-3">
                    <Label htmlFor="professeur_nom" className="text-[var(--foreground)]">
                        {translations?.professeur_form_last_name_label || 'Last Name'} *
                    </Label>
                    <Input
                        id="professeur_nom"
                        type="text"
                        value={data.professeur_nom}
                        onChange={(e) => setData('professeur_nom', e.target.value)}
                        required
                        className="mt-1"
                    />
                    {errors.professeur_nom && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.professeur_nom}</p>}
                </div>
                <div className="sm:col-span-full">
                    <Label htmlFor="email" className="text-[var(--foreground)]">
                        {translations?.user_form_email_label || 'Email'} *
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        className="mt-1"
                        disabled={isEdit && professeurToEdit?.user?.email}
                    />
                    {isEdit && (
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            {translations?.professeur_form_email_edit_notice || 'Email cannot be changed after creation for login consistency.'}
                        </p>
                    )}
                    {errors.email && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.email}</p>}
                </div>
            </fieldset>

            <fieldset className="grid grid-cols-1 gap-x-6 gap-y-6 rounded-md border border-[var(--border)] p-4 sm:grid-cols-6">
                <legend className="px-1 text-sm leading-6 font-semibold text-[var(--foreground)]">
                    {translations?.professeur_form_details_section_legend || 'Professional Details'}
                </legend>
                <div className="sm:col-span-3">
                    <Label htmlFor="service_id">{translations?.professeur_form_service_label || 'Service'} *</Label>
                    <Select
                        value={data.service_id?.toString()}
                        onValueChange={(value) => setData('service_id', value ? parseInt(value, 10) : '')}
                        required
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder={translations?.professeur_form_select_service_placeholder || 'Select Service'} />
                        </SelectTrigger>
                        <SelectContent>
                            {(services || []).map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                    {s.nom}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.service_id && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.service_id}</p>}
                </div>
                <div className="sm:col-span-3">
                    <Label htmlFor="specialite">{translations?.professeur_form_specialty_label || 'Specialty'} *</Label>
                    <Select value={data.specialite || ''} onValueChange={(value) => setData('specialite', value)} required>
                        <SelectTrigger className="mt-1 w-full">
                            <SelectValue placeholder={translations?.professeur_form_select_specialty_placeholder || 'Select Specialty'} />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(specialties || {}).map(([key, displayText]) => (
                                <SelectItem key={key} value={key}>
                                    {displayText}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.specialite && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.specialite}</p>}
                </div>
                <div className="sm:col-span-2">
                    <Label htmlFor="rang">{translations?.professeur_form_rank_label || 'Rank'} *</Label>
                    <Select value={data.rang} onValueChange={(value) => setData('rang', value)} required>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder={translations?.professeur_form_select_rank_placeholder || 'Select Rank'} />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(rangs || {}).map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.rang && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.rang}</p>}
                </div>
                <div className="sm:col-span-2">
                    <Label htmlFor="statut">{translations?.professeur_form_status_label || 'Status'} *</Label>
                    <Select value={data.statut} onValueChange={(value) => setData('statut', value)} required>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder={translations?.professeur_form_select_status_placeholder || 'Select Status'} />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(statuts || {}).map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.statut && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.statut}</p>}
                </div>
                <div className="sm:col-span-2">
                    <Label htmlFor="date_recrutement">{translations?.professeur_form_recruitment_date_label || 'Recruitment Date'} *</Label>
                    <Input
                        id="date_recrutement"
                        type="date"
                        value={data.date_recrutement}
                        onChange={(e) => setData('date_recrutement', e.target.value)}
                        required
                        className="mt-1"
                    />
                    {errors.date_recrutement && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.date_recrutement}</p>}
                </div>
                <div className="flex items-center space-x-2 pt-2 sm:col-span-full">
                    <Checkbox
                        id="is_chef_service"
                        checked={data.is_chef_service}
                        onCheckedChange={(checked) => setData('is_chef_service', checked)}
                    />
                    <Label htmlFor="is_chef_service">{translations?.professeur_form_head_of_service_label || 'Head of Service'}</Label>
                    {errors.is_chef_service && <p className="ml-2 text-sm text-[var(--destructive)]">{errors.is_chef_service}</p>}
                </div>
            </fieldset>

            <fieldset className="rounded-md border border-[var(--border)] p-4">
                <legend className="px-1 text-sm leading-6 font-semibold text-[var(--foreground)]">
                    {translations?.professeur_form_modules_section_legend || 'Assigned Modules'}
                </legend>
                <div className="mt-2 grid max-h-60 grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
                    {(modules || []).map((module) => (
                        <div key={module.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`module-${module.id}`}
                                checked={(data.module_ids || []).includes(module.id)}
                                onCheckedChange={() => handleModuleChange(module.id)}
                            />
                            <Label htmlFor={`module-${module.id}`} className="font-normal">
                                {module.nom}
                            </Label>
                        </div>
                    ))}
                </div>
                {errors.module_ids && <p className="mt-2 text-sm text-[var(--destructive)]">{errors.module_ids}</p>}
            </fieldset>

            <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-[var(--border)] pt-6">
                <Button variant="outline" type="button" asChild>
                    <Link href={route('admin.professeurs.index')}>{translations?.cancel_button || 'Annuler'}</Link>
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
