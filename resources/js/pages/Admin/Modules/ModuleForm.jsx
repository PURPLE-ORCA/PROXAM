import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

export default function ModuleForm({ data, setData, errors, filieres, allLevels, allDistinctModuleNames, isEdit }) {
    const [selectedFiliere, setSelectedFiliere] = useState('');
    const [availableLevels, setAvailableLevels] = useState([]);
    const [moduleNameQuery, setModuleNameQuery] = useState('');

    useEffect(() => {
        if (data.level_id && allLevels) {
            const currentLevel = allLevels.find(l => l.id.toString() === data.level_id.toString());
            if (currentLevel) {
                setSelectedFiliere(currentLevel.filiere_id.toString());
            }
        }
    }, [data.level_id, allLevels]);

    useEffect(() => {
        if (selectedFiliere) {
            setAvailableLevels(allLevels.filter(l => l.filiere_id.toString() === selectedFiliere));
        } else {
            setAvailableLevels([]);
        }
    }, [selectedFiliere, allLevels]);

    const handleFiliereChange = (filiereId) => {
        setSelectedFiliere(filiereId);
        setData('level_id', ''); // Reset level when filiere changes
    };

    const filteredModuleNames = moduleNameQuery === '' ? allDistinctModuleNames : allDistinctModuleNames.filter(name => name.toLowerCase().includes(moduleNameQuery.toLowerCase()));

    return (
        <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="filiere-filter">Study Field</Label>
                    <Select value={selectedFiliere} onValueChange={handleFiliereChange} disabled={isEdit}>
                        <SelectTrigger><SelectValue placeholder="Select Field" /></SelectTrigger>
                        <SelectContent>
                            {(filieres || []).map(f => <SelectItem key={f.id} value={f.id.toString()}>{f.nom}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="level_id">Level</Label>
                    <Select value={data.level_id} onValueChange={value => setData('level_id', value)} disabled={!selectedFiliere || isEdit} required>
                        <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                        <SelectContent>
                            {(availableLevels || []).map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.nom}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {errors.level_id && <p className="text-sm text-destructive">{errors.level_id}</p>}
                </div>
            </div>
            <div>
                <Label htmlFor="nom_combobox">Module Name</Label>
                <Combobox value={data.nom} onChange={value => setData('nom', value)}>
                    <div className="relative">
                        <ComboboxInput
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            onChange={(e) => setModuleNameQuery(e.target.value)}
                            displayValue={moduleName => moduleName}
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2"><Icon icon="mdi:chevron-up-down" /></ComboboxButton>
                    </div>
                    <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover text-popover-foreground shadow-lg">
                        {filteredModuleNames.map(name => <ComboboxOption key={name} value={name}>{name}</ComboboxOption>)}
                        {moduleNameQuery && !filteredModuleNames.includes(moduleNameQuery) && (
                            <ComboboxOption value={moduleNameQuery}>Create "{moduleNameQuery}"</ComboboxOption>
                        )}
                    </ComboboxOptions>
                </Combobox>
                {errors.nom && <p className="mt-1 text-sm text-destructive">{errors.nom}</p>}
            </div>
        </div>
    );
}
