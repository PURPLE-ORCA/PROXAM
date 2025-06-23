import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { useMemo, useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { TranslationContext } from '@/context/TranslationProvider';


// This component now receives its state and handlers as props
export default function ExamenForm({
    data,
    setData,
    errors,
    isEdit,
    quadrimestres,
    allFilieres,
    allLevels,
    allModules,
    salles,
    types,
}) {
    // Local UI state for cascading selects is still fine here
    const [selectedFiliereId, setSelectedFiliereId] = useState('');
    const [selectedLevelId, setSelectedLevelId] = useState('');
    const { translations } = useContext(TranslationContext);

    // --- MODIFIED EFFECT ---
    // This effect now initializes the local state based on the DATA prop
    useEffect(() => {
        if (data && data.module_id) {
            const module = allModules.find(m => m.id.toString() === data.module_id.toString());
            if (module?.level) {
                setSelectedFiliereId(module.level.filiere_id.toString());
                setSelectedLevelId(module.level.id.toString());
            }
        }
    }, [data.module_id, allModules, data]); // Watch the data prop, not isEdit

    // --- EFFECT 2: Fetch default room config when module changes ---
    useEffect(() => {
        // Only run this if we are CREATING a new exam and a module has been selected.
        // On edit, the data is already pre-filled.
        if (!isEdit && data && data.module_id) {
            axios.get(route('admin.modules.default-exam-config', { module: data.module_id }))
                .then(response => {
                    const roomConfigs = response.data.room_configs || [];
                    const newSallesPivot = roomConfigs.map(config => ({
                        salle_id: config.salle_id.toString(),
                        capacite: config.configured_capacity.toString(),
                        professeurs_assignes_salle: config.configured_prof_count.toString(),
                    }));
                    setData('salles_pivot', newSallesPivot);
                })
                .catch(error => {
                    console.error("Failed to fetch default room config:", error);
                });
        }
    }, [data, isEdit]); // Dependency array is key!

    // Handlers for user interaction
    const handleFiliereChange = (filiereId) => {
        setSelectedFiliereId(filiereId);
        setSelectedLevelId('');
        setData(data => ({ ...data, module_id: '' })); // Reset module in main form
    };

    const handleLevelChange = (levelId) => {
        setSelectedLevelId(levelId);
        setData(data => ({ ...data, module_id: '' })); // Reset module in main form
    };

    // Memos for derived dropdown options (this logic is good)
    const availableLevels = useMemo(() => allLevels.filter(l => l.filiere_id.toString() === selectedFiliereId), [selectedFiliereId, allLevels]);
    const availableModulesForSelect = useMemo(() => allModules.filter(m => m.level_id.toString() === selectedLevelId), [selectedLevelId, allModules]);
    const totalRequiredProfessors = useMemo(() => (data.salles_pivot || []).reduce((sum, salle) => sum + (parseInt(salle.professeurs_assignes_salle, 10) || 0), 0), [data.salles_pivot]);

    // Handlers for dynamic room list (this logic is good)
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

    return (
        <div className="space-y-6">
            <fieldset className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-md border border-[var(--border)] p-4 sm:grid-cols-6">
                <legend className="px-1 text-sm leading-6 font-semibold text-[var(--foreground)]">
                    Basic Exam Details
                </legend>

                <div className="sm:col-span-3">
                    <Label htmlFor="nom">Exam Name (Optional)</Label>
                    <Input id="nom" type="text" value={data.nom || ''} onChange={(e) => setData('nom', e.target.value)} className="mt-1" />
                    {errors.nom && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.nom}</p>}
                </div>

                <div className="sm:col-span-3">
                    <Label htmlFor="filiere_for_module_select">Study Field *</Label>
                    <Select
                        value={selectedFiliereId}
                        onValueChange={handleFiliereChange}
                        required
                    >
                        <SelectTrigger id="filiere_for_module_select" className="mt-1">
                            <SelectValue placeholder="Select Field" />
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
                    <Label htmlFor="level_for_module_select">Level *</Label>
                    <Select
                        value={selectedLevelId}
                        onValueChange={handleLevelChange}
                        disabled={!selectedFiliereId}
                        required
                    >
                        <SelectTrigger id="level_for_module_select" className="mt-1">
                            <SelectValue placeholder="Select Level" />
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
                    <Label htmlFor="module_id">Module *</Label>
                    <Select
                        value={data.module_id || ''}
                        onValueChange={(v) => setData('module_id', v)}
                        disabled={!selectedLevelId}
                        required
                    >
                        <SelectTrigger id="module_id" className="mt-1">
                            <SelectValue placeholder="Select Module" />
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
                    <Label htmlFor="quadrimestre_id">Semester *</Label>
                    <Select value={data.quadrimestre_id || ''} onValueChange={(v) => setData('quadrimestre_id', v)} required>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select Semester" />
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
                    <Label htmlFor="type">Type *</Label>
                    <Select value={data.type || ''} onValueChange={(v) => setData('type', v)} required>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select Type" />
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
                    <Label htmlFor="debut">Start Date & Time *</Label>
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
                        Total Required Professors (Calculated)
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
                <legend className="px-1 text-sm leading-6 font-semibold text-[var(--foreground)]">
                    Assigned Rooms & Capacities *
                </legend>
                {(data.salles_pivot || []).map((salleEntry, index) => (
                    <div key={index} className="mb-3 grid grid-cols-12 items-end gap-x-4">
                        <div className="col-span-5">
                            <Label htmlFor={`salle_id_${index}`}>
                                Room #{index + 1}
                            </Label>
                            <Select value={salleEntry.salle_id || ''} onValueChange={(value) => handleSalleChange(index, 'salle_id', value)} required>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Room" />
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
                                Capacity Override
                            </Label>
                            <Input
                                type="number"
                                id={`capacite_${index}`}
                                min="0"
                                value={salleEntry.capacite || ''}
                                onChange={(e) => handleSalleChange(index, 'capacite', e.target.value)}
                                required
                                className="mt-1"
                                placeholder="Enter capacity"
                            />
                            {errors[`salles_pivot.${index}.capacite`] && (
                                <p className="mt-1 text-sm text-[var(--destructive)]">{errors[`salles_pivot.${index}.capacite`]}</p>
                            )}
                        </div>
                        <div className="col-span-3">
                            <Label htmlFor={`profs_salle_${index}`}>Profs in Room</Label>
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
                    Add Another Room
                </Button>
                {errors.salles_pivot && typeof errors.salles_pivot === 'string' && (
                    <p className="mt-2 text-sm text-[var(--destructive)]">{errors.salles_pivot}</p>
                )}
            </fieldset>
        </div>
    );
}
