import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslationContext } from '@/context/TranslationProvider';
import { Icon } from '@iconify/react';
import { Link, useForm } from '@inertiajs/react';
import { useMemo, useContext, useState, useEffect } from 'react';

const formatDatetimeForInput = (datetimeString) => {
    if (!datetimeString) return '';
    try {
        const date = new Date(datetimeString);
        // Adjust for timezone offset to display correctly in local time input
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    } catch (e) {
        return '';
    }
};

export default function ExamenForm({
    isEdit = false,
    examenToEdit,
    // ... other data props ...
    quadrimestres,
    allFilieres,
    allLevels,
    allModules,
    salles,
    types,
}) {
    const { translations } = useContext(TranslationContext);

    // Initialize EVERYTHING from props directly in useState/useForm
    const { data, setData, post, put, processing, errors, reset } = useForm({
        nom: examenToEdit?.nom || '',
        quadrimestre_id: examenToEdit?.quadrimestre_id?.toString() || '',
        module_id: examenToEdit?.module_id?.toString() || '',
        type: examenToEdit?.type || '',
        debut: formatDatetimeForInput(examenToEdit?.debut),
        salles_pivot: (examenToEdit?.salles || []).map((s) => ({
            salle_id: s.id.toString(),
            capacite: s.pivot.capacite.toString(),
            professeurs_assignes_salle: s.pivot.professeurs_assignes_salle.toString(),
        })),
    });

    // Initialize the cascading select IDs from the prop
    const [selectedFiliereId, setSelectedFiliereId] = useState(
        () => examenToEdit?.module?.level?.filiere_id?.toString() || ''
    );
    const [selectedLevelId, setSelectedLevelId] = useState(
        () => examenToEdit?.module?.level_id?.toString() || ''
    );

    // Effects to handle USER changes
    const handleFiliereChange = (filiereId) => {
        setSelectedFiliereId(filiereId);
        // On user change, reset downstream
        setSelectedLevelId('');
        setData('module_id', '');
    };
    const handleLevelChange = (levelId) => {
        setSelectedLevelId(levelId);
        // On user change, reset downstream
        setData('module_id', '');
    };

    // Derived options for dropdowns
    const availableLevels = useMemo(() => {
        if (!selectedFiliereId) return [];
        return allLevels.filter(l => l.filiere_id.toString() === selectedFiliereId);
    }, [selectedFiliereId, allLevels]);

    const availableModulesForSelect = useMemo(() => {
        if (!selectedLevelId) return [];
        return allModules.filter(m => m.level_id.toString() === selectedLevelId);
    }, [selectedLevelId, allModules]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.examens.update', { examen: examenToEdit.id }), { preserveScroll: true });
        } else {
            post(route('admin.examens.store'), {
                preserveScroll: true,
                onSuccess: () => reset(),
            });
        }
    };

    const handleSalleChange = (index, field, value) => {
        const updatedSalles = JSON.parse(JSON.stringify(data.salles_pivot || []));
        updatedSalles[index] = { ...updatedSalles[index], [field]: value };
        if (field === 'salle_id' && value) {
            const selectedSalleInfo = salles.find((s) => s.id.toString() === value);
            if (selectedSalleInfo) {
                if (updatedSalles[index].capacite === undefined || updatedSalles[index].capacite === '') {
                    updatedSalles[index].capacite = selectedSalleInfo.default_capacite.toString();
                }
                if (updatedSalles[index].professeurs_assignes_salle === undefined || updatedSalles[index].professeurs_assignes_salle === '') {
                    updatedSalles[index].professeurs_assignes_salle = '1';
                }
            }
        }
        setData('salles_pivot', updatedSalles);
    };

    const addSalleEntry = () => {
        const firstAvailableSalle = salles.find((s) => !(data.salles_pivot || []).some((sp) => sp.salle_id === s.id.toString()));
        setData('salles_pivot', [
            ...(data.salles_pivot || []),
            {
                salle_id: firstAvailableSalle ? firstAvailableSalle.id.toString() : '',
                capacite: firstAvailableSalle ? firstAvailableSalle.default_capacite.toString() : '',
                professeurs_assignes_salle: '1',
            },
        ]);
    };

    const removeSalleEntry = (index) => {
        const updatedSalles = [...(data.salles_pivot || [])];
        updatedSalles.splice(index, 1);
        setData('salles_pivot', updatedSalles);
    };

    const totalRequiredProfessors = useMemo(() => {
        return (data.salles_pivot || []).reduce((sum, salle) => sum + (parseInt(salle.professeurs_assignes_salle, 10) || 0), 0);
    }, [data.salles_pivot]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-md border border-[var(--border)] p-4 sm:grid-cols-6">
                <legend className="px-1 text-sm leading-6 font-semibold text-[var(--foreground)]">
                    {translations?.examen_form_basic_details_legend || 'Basic Exam Details'}
                </legend>

                <div className="sm:col-span-3">
                    <Label htmlFor="nom">{translations?.examen_form_name_label || 'Exam Name (Optional)'}</Label>
                    <Input id="nom" type="text" value={data.nom || ''} onChange={(e) => setData('nom', e.target.value)} className="mt-1" />
                    {errors.nom && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.nom}</p>}
                </div>

                <div className="sm:col-span-3">
                    <Label htmlFor="filiere_for_module_select">{translations?.examen_form_filiere_label || 'Study Field'} *</Label>
                    <Select
                        value={selectedFiliereId}
                        onValueChange={handleFiliereChange} // Use local state handler
                        required
                    >
                        <SelectTrigger id="filiere_for_module_select" className="mt-1">
                            <SelectValue placeholder={translations?.examen_form_select_filiere_placeholder || 'Select Field'} />
                        </SelectTrigger>
                        <SelectContent>
                            {(allFilieres || []).map((f) => (
                                <SelectItem key={f.id} value={f.id.toString()}>
                                    {f.nom}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="sm:col-span-3">
                    <Label htmlFor="level_for_module_select">{translations?.examen_form_level_label || 'Level'} *</Label>
                    <Select
                        value={selectedLevelId}
                        onValueChange={handleLevelChange} // Use local state handler
                        disabled={!selectedFiliereId}
                        required
                    >
                        <SelectTrigger id="level_for_module_select" className="mt-1">
                            <SelectValue placeholder={translations?.examen_form_select_level_placeholder || 'Select Level'} />
                        </SelectTrigger>
                        <SelectContent>
                            {(availableLevels || []).map((l) => (
                                <SelectItem key={l.id} value={l.id.toString()}>
                                    {l.nom}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="sm:col-span-3">
                    <Label htmlFor="module_id">{translations?.examen_form_module_label || 'Module'} *</Label>
                    <Select
                        value={data.module_id || ''}
                        onValueChange={(v) => setData('module_id', v)} // Directly set form data
                        disabled={!selectedLevelId}
                        required
                    >
                        <SelectTrigger id="module_id" className="mt-1">
                            <SelectValue placeholder={translations?.examen_form_select_module_placeholder || 'Select Module'} />
                        </SelectTrigger>
                        <SelectContent>
                            {(availableModulesForSelect || []).map((m) => (
                                <SelectItem key={m.id} value={m.id.toString()}>
                                    {m.nom}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.module_id && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.module_id}</p>}
                </div>

                <div className="sm:col-span-full">
                    <Label htmlFor="quadrimestre_id">{translations?.examen_form_quadrimestre_label || 'Semester'} *</Label>
                    <Select value={data.quadrimestre_id || ''} onValueChange={(v) => setData('quadrimestre_id', v)} required>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder={translations?.examen_form_select_quadrimestre_placeholder || 'Select Semester'} />
                        </SelectTrigger>
                        <SelectContent>
                            {(quadrimestres || []).map((q) => (
                                <SelectItem key={q.id} value={q.id.toString()}>
                                    {q.display_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.quadrimestre_id && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.quadrimestre_id}</p>}
                </div>

                <div className="sm:col-span-3">
                    <Label htmlFor="type">{translations?.examen_form_type_label || 'Type'} *</Label>
                    <Select value={data.type || ''} onValueChange={(v) => setData('type', v)} required>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder={translations?.examen_form_select_type_placeholder || 'Select Type'} />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(types || {}).map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.type && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.type}</p>}
                </div>
                <div className="sm:col-span-3">
                    <Label htmlFor="debut">{translations?.examen_form_start_datetime_label || 'Start Date & Time'} *</Label>
                    <Input
                        id="debut"
                        type="datetime-local"
                        value={data.debut || ''}
                        onChange={(e) => setData('debut', e.target.value)}
                        required
                        className="mt-1"
                    />
                    {errors.debut && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.debut}</p>}
                </div>
                <div className="sm:col-span-full">
                    <Label className="text-[var(--foreground)]">
                        {translations?.examen_form_total_req_profs_label || 'Total Required Professors (Calculated)'}
                    </Label>
                    <Input
                        type="number"
                        value={totalRequiredProfessors}
                        disabled
                        readOnly
                        className="mt-1 bg-[var(--muted)] text-[var(--muted-foreground)]"
                    />
                </div>
            </fieldset>

            <fieldset className="relative rounded-md border border-[var(--border)] p-4">
                {/* Removed isLoadingModuleConfig and loading overlay */}
                <legend className="px-1 text-sm leading-6 font-semibold text-[var(--foreground)]">
                    {translations?.examen_form_salles_section_legend || 'Assigned Rooms & Capacities'} *
                </legend>
                {(data.salles_pivot || []).map((salleEntry, index) => (
                    <div key={index} className="mb-3 grid grid-cols-12 items-end gap-x-4">
                        <div className="col-span-5">
                            <Label htmlFor={`salle_id_${index}`}>
                                {translations?.examen_form_salle_label || 'Room'} #{index + 1}
                            </Label>
                            <Select value={salleEntry.salle_id || ''} onValueChange={(value) => handleSalleChange(index, 'salle_id', value)} required>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={translations?.examen_form_select_salle_placeholder || 'Select Room'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(salles || []).map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={s.id.toString()}
                                            disabled={(data.salles_pivot || []).some((sp, i) => i !== index && sp.salle_id === s.id.toString())}
                                        >
                                            {s.nom} (Default: {s.default_capacite})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors[`salles_pivot.${index}.salle_id`] && (
                                <p className="mt-1 text-sm text-[var(--destructive)]">{errors[`salles_pivot.${index}.salle_id`]}</p>
                            )}
                        </div>
                        <div className="col-span-3">
                            <Label htmlFor={`capacite_${index}`}>
                                {translations?.examen_form_salle_capacity_override_label || 'Capacity Override'}
                            </Label>
                            <Input
                                type="number"
                                id={`capacite_${index}`}
                                min="0"
                                value={salleEntry.capacite || ''}
                                onChange={(e) => handleSalleChange(index, 'capacite', e.target.value)}
                                required
                                className="mt-1"
                                placeholder={translations?.examen_form_salle_capacity_placeholder || 'Enter capacity'}
                            />
                            {errors[`salles_pivot.${index}.capacite`] && (
                                <p className="mt-1 text-sm text-[var(--destructive)]">{errors[`salles_pivot.${index}.capacite`]}</p>
                            )}
                        </div>
                        <div className="col-span-3">
                            <Label htmlFor={`profs_salle_${index}`}>{translations?.examen_form_salle_prof_count_label || 'Profs in Room'}</Label>
                            <Input
                                type="number"
                                id={`profs_salle_${index}`}
                                min="0"
                                value={salleEntry.professeurs_assignes_salle || ''}
                                onChange={(e) => handleSalleChange(index, 'professeurs_assignes_salle', e.target.value)}
                                required
                                className="mt-1"
                            />
                            {errors[`salles_pivot.${index}.professeurs_assignes_salle`] && (
                                <p className="mt-1 text-sm text-[var(--destructive)]">{errors[`salles_pivot.${index}.professeurs_assignes_salle`]}</p>
                            )}
                        </div>
                        <div className="col-span-1">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeSalleEntry(index)}
                                className="mt-auto mb-[1px] h-9 w-full"
                            >
                                <Icon icon="mdi:delete" className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addSalleEntry} className="mt-2">
                    {translations?.examen_form_add_salle_button || 'Add Another Room'}
                </Button>
                {errors.salles_pivot && typeof errors.salles_pivot === 'string' && (
                    <p className="mt-2 text-sm text-[var(--destructive)]">{errors.salles_pivot}</p>
                )}
            </fieldset>

            <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-[var(--border)] pt-6">
                <Button variant="outline" type="button" asChild>
                    <Link href={route('admin.examens.index')}>{translations?.cancel_button || 'Annuler'}</Link>
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
