import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select as ShadcnSelect } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TranslationContext } from '@/context/TranslationProvider';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { Icon } from '@iconify/react';
import { Link } from '@inertiajs/react';
import { useContext, useMemo, useState } from 'react';

// Define string constants
const SPECIALITE_MEDICAL_KEY = 'medical';
const SPECIALITE_SURGICAL_KEY = 'surgical';

// This component now receives its state and handlers as props.
// It no longer manages its own form state.
export default function ProfesseurForm({
    isEdit,
    data,
    setData,
    errors,
    services,
    modules,
    rangs,
    statuts,
    existingSpecialties,
}) {
    const { translations } = useContext(TranslationContext);
    const [specialtyQuery, setSpecialtyQuery] = useState('');

    const allSpecialtyOptions = useMemo(() => {
        const preferred = [
            { id: SPECIALITE_MEDICAL_KEY, name: translations?.professeur_specialty_medical || 'Medical' },
            { id: SPECIALITE_SURGICAL_KEY, name: translations?.professeur_specialty_surgical || 'Surgical' },
        ];

        const existing = (existingSpecialties || [])
            .filter((spec) => spec !== SPECIALITE_MEDICAL_KEY && spec !== SPECIALITE_SURGICAL_KEY)
            .map((spec) => ({ id: spec, name: spec }));

        const combined = [...preferred, ...existing];
        const uniqueMap = new Map();
        combined.forEach((item) => uniqueMap.set(item.id, item));
        return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [existingSpecialties, translations]);

    const filteredSpecialties =
        specialtyQuery === ''
            ? allSpecialtyOptions
            : allSpecialtyOptions.filter((spec) => spec.name.toLowerCase().includes(specialtyQuery.toLowerCase()));

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

    // Improved display value function for specialty combobox
    const getSpecialtyDisplayValue = (value) => {
        if (!value) return '';

        // Check if it's one of our predefined options
        const predefinedOption = allSpecialtyOptions.find((opt) => opt.id === value);
        if (predefinedOption) {
            return predefinedOption.name;
        }

        // If not predefined, return the value as is (custom specialty)
        return value;
    };

    // Handle specialty selection properly
    const handleSpecialtyChange = (value) => {
        console.log('Specialty changed to:', value);
        setData('specialite', value);
        setSpecialtyQuery('');
    };

    return (
        <div className="space-y-6 pr-1">
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
                        value={data.professeur_prenom || ''}
                        onChange={(e) => setData('professeur_prenom', e.target.value)}
                        required
                        className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
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
                        value={data.professeur_nom || ''}
                        onChange={(e) => setData('professeur_nom', e.target.value)}
                        required
                        className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
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
                        value={data.email || ''}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                    />
                    {isEdit && (
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                            {translations?.professeur_form_email_edit_notice || 'Email can be changed during edit.'}
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
                    <ShadcnSelect value={data.service_id?.toString() || ''} onValueChange={(value) => setData('service_id', value)} required>
                        <SelectTrigger className="mt-1 w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]">
                            <SelectValue placeholder={translations?.professeur_form_select_service_placeholder || 'Select Service'} />
                        </SelectTrigger>
                        <SelectContent className="border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]">
                            {(services || []).map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                    {s.nom}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </ShadcnSelect>
                    {errors.service_id && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.service_id}</p>}
                </div>

                <div className="sm:col-span-3">
                    <Label className="block text-sm leading-6 font-medium text-[var(--foreground)]">
                        {translations?.professeur_form_specialty_label || 'Specialty'} *
                    </Label>
                    <div className="relative mt-1">
                        <Combobox value={data.specialite || ''} onChange={handleSpecialtyChange} name="specialite">
                            <div className="relative">
                                <ComboboxInput
                                    className="w-full rounded-md border-0 bg-[var(--background)] py-1.5 pr-10 pl-3 text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)] ring-inset focus:ring-2 focus:ring-[var(--ring)] focus:ring-inset sm:text-sm sm:leading-6"
                                    onChange={(event) => setSpecialtyQuery(event.target.value)}
                                    displayValue={() => getSpecialtyDisplayValue(data.specialite)}
                                    autoComplete="off"
                                    required
                                />
                                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                                    <Icon icon="mdi:chevron-down" className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                </ComboboxButton>
                            </div>

                            <ComboboxOptions className="ring-opacity-5 absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-[var(--popover)] py-1 text-base shadow-lg ring-1 ring-[var(--border)] focus:outline-none sm:text-sm">
                                {specialtyQuery.length > 0 &&
                                    !allSpecialtyOptions.some((opt) => opt.name.toLowerCase() === specialtyQuery.toLowerCase()) && (
                                        <ComboboxOption
                                            value={specialtyQuery}
                                            className="relative cursor-default py-2 pr-9 pl-3 text-[var(--popover-foreground)] select-none data-[focus]:bg-[var(--accent)] data-[focus]:text-[var(--accent-foreground)]"
                                        >
                                            <span className="block truncate italic">
                                                {translations?.create_new_specialty || 'Create:'} "{specialtyQuery}"
                                            </span>
                                        </ComboboxOption>
                                    )}
                                {filteredSpecialties.map((spec) => (
                                    <ComboboxOption
                                        key={spec.id}
                                        value={spec.id}
                                        className="relative cursor-default py-2 pr-4 pl-8 text-[var(--popover-foreground)] select-none data-[focus]:bg-[var(--accent)] data-[focus]:text-[var(--accent-foreground)]"
                                    >
                                        <span className={`block truncate ${data.specialite === spec.id ? 'font-semibold' : ''}`}>{spec.name}</span>
                                        {data.specialite === spec.id && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-[var(--primary)]">
                                                <Icon icon="mdi:check" className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                        )}
                                    </ComboboxOption>
                                ))}
                            </ComboboxOptions>
                        </Combobox>
                    </div>
                    {errors.specialite && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.specialite}</p>}
                </div>

                <div className="sm:col-span-2">
                    <Label htmlFor="rang">{translations?.professeur_form_rank_label || 'Rank'} *</Label>
                    <ShadcnSelect value={data.rang || ''} onValueChange={(value) => setData('rang', value)} required>
                        <SelectTrigger className="mt-1 w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]">
                            <SelectValue placeholder={translations?.professeur_form_select_rank_placeholder || 'Select Rank'} />
                        </SelectTrigger>
                        <SelectContent className="border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]">
                            {Object.entries(rangs || {}).map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </ShadcnSelect>
                    {errors.rang && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.rang}</p>}
                </div>
                <div className="sm:col-span-2">
                    <Label htmlFor="statut">{translations?.professeur_form_status_label || 'Status'} *</Label>
                    <ShadcnSelect value={data.statut || ''} onValueChange={(value) => setData('statut', value)} required>
                        <SelectTrigger className="mt-1 w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]">
                            <SelectValue placeholder={translations?.professeur_form_select_status_placeholder || 'Select Status'} />
                        </SelectTrigger>
                        <SelectContent className="border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]">
                            {Object.entries(statuts || {}).map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </ShadcnSelect>
                    {errors.statut && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.statut}</p>}
                </div>
                <div className="sm:col-span-2">
                    <Label htmlFor="date_recrutement">{translations?.professeur_form_recruitment_date_label || 'Recruitment Date'} *</Label>
                    <Input
                        id="date_recrutement"
                        type="date"
                        value={data.date_recrutement || ''}
                        onChange={(e) => setData('date_recrutement', e.target.value)}
                        required
                        className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                    />
                    {errors.date_recrutement && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.date_recrutement}</p>}
                </div>
                <div className="flex items-center space-x-2 pt-2 sm:col-span-full">
                    <Checkbox
                        id="is_chef_service"
                        checked={Boolean(data.is_chef_service)}
                        onCheckedChange={(checkedState) => setData('is_chef_service', checkedState === true)}
                    />
                    <Label htmlFor="is_chef_service" className="font-normal text-[var(--foreground)]">
                        {translations?.professeur_form_head_of_service_label || 'Head of Service'}
                    </Label>
                    {errors.is_chef_service && <p className="ml-2 text-sm text-[var(--destructive)]">{errors.is_chef_service}</p>}
                </div>
            </fieldset>

            <fieldset className="rounded-md border border-[var(--border)] p-4">
                <legend className="px-1 text-sm leading-6 font-semibold text-[var(--foreground)]">
                    {translations?.professeur_form_modules_section_legend || 'Assigned Modules'}
                </legend>
                <ScrollArea className="h-60 w-full rounded-md border p-4 scrollbar-hide">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {(modules || []).map((module) => (
                            <div key={module.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`module-${module.id}`}
                                    checked={(data.module_ids || []).includes(module.id)}
                                    onCheckedChange={() => handleModuleChange(module.id)}
                                />
                                <Label htmlFor={`module-${module.id}`} className="font-normal text-[var(--foreground)]">
                                    {module.nom}
                                </Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                {errors.module_ids && <p className="mt-2 text-sm text-[var(--destructive)]">{errors.module_ids}</p>}
            </fieldset>
        </div>
    );
}
