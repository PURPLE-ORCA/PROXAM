import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslationContext } from '@/context/TranslationProvider';
import { Icon } from '@iconify/react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

export default function ExamenForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    quadrimestres,
    allFilieres,
    allLevels,
    allModules,
    salles,
    types,
    isEdit = false,
    examenToEdit,
}) {
    const { translations } = useContext(TranslationContext);

    const [selectedFiliereId, setSelectedFiliereId] = useState('');
    const [availableLevels, setAvailableLevels] = useState([]);
    const [selectedLevelId, setSelectedLevelId] = useState('');
    const [availableModulesForSelect, setAvailableModulesForSelect] = useState([]);
    const [isLoadingModuleConfig, setIsLoadingModuleConfig] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Helper function to initialize cascading selects based on module_id
    const initializeCascadingSelects = useCallback(
        (moduleId) => {
            if (!moduleId || !allModules || !allLevels || !allFilieres) return;

            const currentModule = allModules.find((m) => m.id.toString() === moduleId.toString());
            if (currentModule && currentModule.level_id) {
                const currentLevel = allLevels.find((l) => l.id === currentModule.level_id);
                if (currentLevel && currentLevel.filiere_id) {
                    setSelectedFiliereId(currentLevel.filiere_id.toString());
                    setSelectedLevelId(currentLevel.id.toString());

                    // Set available levels for this filiere
                    setAvailableLevels(allLevels.filter((l) => l.filiere_id.toString() === currentLevel.filiere_id.toString()));

                    // Set available modules for this level
                    setAvailableModulesForSelect(allModules.filter((m) => m.level_id.toString() === currentLevel.id.toString()));
                }
            }
        },
        [allModules, allLevels, allFilieres],
    );

    // Effect to initialize form state when in EDIT mode
    useEffect(() => {
        if (isEdit && examenToEdit && !isInitialized) {
            setData({
                nom: examenToEdit.nom || '',
                quadrimestre_id: examenToEdit.quadrimestre_id?.toString() || '',
                module_id: examenToEdit.module_id?.toString() || '',
                type: examenToEdit.type || '',
                debut: examenToEdit.debut
                    ? new Date(new Date(examenToEdit.debut).getTime() - new Date(examenToEdit.debut).getTimezoneOffset() * 60000)
                          .toISOString()
                          .slice(0, 16)
                    : '',
                salles_pivot: (examenToEdit.salles || []).map((s) => ({
                    salle_id: s.id.toString(),
                    capacite: s.pivot.capacite.toString(),
                    professeurs_assignes_salle: s.pivot.professeurs_assignes_salle.toString(),
                })),
            });

            // Initialize cascading selects
            if (examenToEdit.module_id) {
                initializeCascadingSelects(examenToEdit.module_id.toString());
            }

            setIsInitialized(true);
        } else if (!isEdit && !isInitialized) {
            // Reset for CREATE mode
            setData({
                nom: '',
                quadrimestre_id: '',
                module_id: '',
                type: '',
                debut: '',
                salles_pivot: [],
            });
            setSelectedFiliereId('');
            setSelectedLevelId('');
            setAvailableLevels([]);
            setAvailableModulesForSelect([]);
            setIsInitialized(true);
        }
    }, [isEdit, examenToEdit, setData, initializeCascadingSelects, isInitialized]);

    // Update available levels when selectedFiliereId changes (user interaction)
    useEffect(() => {
        if (!isInitialized) return; // Don't run during initialization

        if (selectedFiliereId && allLevels) {
            const newAvailableLevels = allLevels.filter((l) => l.filiere_id.toString() === selectedFiliereId);
            setAvailableLevels(newAvailableLevels);

            // If current level doesn't belong to new filiere, reset it
            if (data.module_id && allModules && allLevels) {
                const currentModule = allModules.find((m) => m.id.toString() === data.module_id);
                const currentLevel = currentModule ? allLevels.find((l) => l.id === currentModule.level_id) : null;
                if (!currentLevel || currentLevel.filiere_id.toString() !== selectedFiliereId) {
                    setSelectedLevelId('');
                    setData('module_id', '');
                }
            }
        } else {
            setAvailableLevels([]);
            if (!selectedFiliereId) {
                setSelectedLevelId('');
                setData('module_id', '');
            }
        }
    }, [selectedFiliereId, allLevels, allModules, data.module_id, setData, isInitialized]);

    // Update available modules when selectedLevelId changes (user interaction)
    useEffect(() => {
        if (!isInitialized) return; // Don't run during initialization

        if (selectedLevelId && allModules) {
            const newAvailableModules = allModules.filter((m) => m.level_id.toString() === selectedLevelId);
            setAvailableModulesForSelect(newAvailableModules);

            // If current module doesn't belong to new level, reset it
            if (data.module_id && allModules) {
                const currentModule = allModules.find((m) => m.id.toString() === data.module_id);
                if (!currentModule || currentModule.level_id.toString() !== selectedLevelId) {
                    setData('module_id', '');
                }
            }
        } else {
            setAvailableModulesForSelect([]);
            if (!selectedLevelId) {
                setData('module_id', '');
            }
        }
    }, [selectedLevelId, allModules, data.module_id, setData, isInitialized]);

    const fetchAndApplyModuleConfig = useCallback(
        async (moduleId) => {
            if (!moduleId) {
                if (!isEdit) setData('salles_pivot', []);
                return;
            }

            // Don't fetch if in edit mode and module hasn't changed
            if (isEdit && examenToEdit && moduleId === examenToEdit.module_id?.toString()) {
                return;
            }

            setIsLoadingModuleConfig(true);
            try {
                const response = await axios.get(route('admin.modules.default-exam-config', { module: moduleId }));
                const config = response.data;
                setData((prevData) => ({
                    ...prevData,
                    salles_pivot: (config.room_configs || []).map((rc) => ({
                        salle_id: rc.salle_id.toString(),
                        capacite: rc.configured_capacity.toString(),
                        professeurs_assignes_salle: rc.configured_prof_count.toString(),
                    })),
                }));
            } catch (error) {
                console.error('Failed to fetch module exam config:', error);
                setData((prevData) => ({ ...prevData, salles_pivot: [] }));
            } finally {
                setIsLoadingModuleConfig(false);
            }
        },
        [setData, isEdit, examenToEdit],
    );

    // Effect to fetch module config when module_id changes
    useEffect(() => {
        if (!isInitialized) return; // Don't run during initialization

        if (data.module_id) {
            fetchAndApplyModuleConfig(data.module_id);
        } else if (!isEdit) {
            setData('salles_pivot', []);
        }
    }, [data.module_id, fetchAndApplyModuleConfig, isEdit, setData, isInitialized]);

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
        <form onSubmit={onSubmit} className="space-y-6">
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
                    <Select value={selectedFiliereId} onValueChange={setSelectedFiliereId} required>
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
                    <Select value={selectedLevelId} onValueChange={setSelectedLevelId} disabled={!selectedFiliereId} required>
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
                    <Select value={data.module_id || ''} onValueChange={(v) => setData('module_id', v)} disabled={!selectedLevelId} required>
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
                {isLoadingModuleConfig && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/70 dark:bg-black/70">
                        <Icon icon="mdi:loading" className="h-8 w-8 animate-spin text-[var(--primary)]" />
                    </div>
                )}
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
                    disabled={processing || isLoadingModuleConfig}
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
                >
                    {processing || isLoadingModuleConfig
                        ? translations?.saving_button || 'Saving...'
                        : isEdit
                          ? translations?.update_button || 'Update'
                          : translations?.save_button || 'Save'}
                </Button>
            </div>
        </form>
    );
}
