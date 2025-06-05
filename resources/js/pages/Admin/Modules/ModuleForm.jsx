import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslationContext } from '@/context/TranslationProvider';
import { Link } from '@inertiajs/react';
import { useContext, useEffect, useState } from 'react';
import { Combobox } from '@headlessui/react';
import { Icon } from '@iconify/react';

export default function ModuleForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    filieres, // Array of { id, nom }
    allLevels, // Array of { id, nom, filiere_id } (filiere_nom is not strictly needed if filiere_id is there)
    isEdit = false,
    // currentLevelIdForCancel is used for the cancel button's destination.
    // If editing, the module's current level_id is the context.
    // If creating from a specific level's page, that level_id is the context.
    currentContextLevelId = null,
    allDistinctModuleNames = [], 
}) {
    const { translations } = useContext(TranslationContext);

    // State for the first part of cascaded select (selected filiere to filter levels)
    // Initialize with the filiere of the current level_id if available
    const [selectedFiliereForLevelFilter, setSelectedFiliereForLevelFilter] = useState(() => {
        if (data.level_id && allLevels) {
            const currentLevel = allLevels.find((l) => l.id.toString() === data.level_id.toString());
            return currentLevel ? currentLevel.filiere_id.toString() : '';
        }
        return '';
    });

    const [availableLevelsForSelectedFiliere, setAvailableLevelsForSelectedFiliere] = useState([]);
    const [moduleNameQuery, setModuleNameQuery] = useState('');

    // Effect to populate filiere filter if data.level_id is set (e.g. on edit)
    useEffect(() => {
        if (data.level_id && allLevels && !selectedFiliereForLevelFilter) {
            const currentLevel = allLevels.find((l) => l.id.toString() === data.level_id.toString());
            if (currentLevel) {
                setSelectedFiliereForLevelFilter(currentLevel.filiere_id.toString());
            }
        }
    }, [data.level_id, allLevels, selectedFiliereForLevelFilter]);

    // Effect to update available levels when selectedFiliereForLevelFilter changes OR allLevels list changes
    useEffect(() => {
        if (selectedFiliereForLevelFilter && allLevels) {
            const filtered = allLevels.filter((level) => level.filiere_id.toString() === selectedFiliereForLevelFilter);
            setAvailableLevelsForSelectedFiliere(filtered);

            // If current data.level_id doesn't belong to the newly selected filiere, reset it
            // This happens when the user changes the filiere dropdown.
            if (data.level_id) {
                const levelInNewFiliere = filtered.find((l) => l.id.toString() === data.level_id.toString());
                if (!levelInNewFiliere) {
                    setData('level_id', ''); // Reset level if not in the new filiere
                }
            }
        } else {
            setAvailableLevelsForSelectedFiliere([]);
            // If no filiere is selected, also clear level_id, unless it was pre-filled for edit and filiere filter also pre-filled
            if (!isEdit || (isEdit && !data.level_id)) {
                // Avoid clearing on initial load of edit form
                setData('level_id', '');
            }
        }
    }, [selectedFiliereForLevelFilter, allLevels, setData, isEdit, data.level_id]);

    const handleFiliereForLevelFilterChange = (filiereId) => {
        setSelectedFiliereForLevelFilter(filiereId);
        // When filiere changes, always reset level_id because the previous level is no longer valid
        setData('level_id', '');
    };

    const cancelRoute = currentContextLevelId
        ? route('admin.modules.index', { level: currentContextLevelId })
        : data.level_id && isEdit // If editing, and level_id is set, try to go to that level's modules
          ? route('admin.modules.index', { level: data.level_id })
          : route('admin.filieres.index'); // Fallback to filieres index

    const filteredModuleNames =
        moduleNameQuery === ''
            ? allDistinctModuleNames
            : allDistinctModuleNames.filter((name) =>
                  name.toLowerCase().includes(moduleNameQuery.toLowerCase())
              );

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                {/* Filiere Selector (to filter Levels) */}
                <div className="sm:col-span-1">
                    <Label htmlFor="filiere_for_level_filter" className="text-[var(--foreground)]">
                        {translations?.module_form_filiere_filter_label || 'Filter by Study Field'} *
                    </Label>
                    <Select
                        value={selectedFiliereForLevelFilter}
                        onValueChange={handleFiliereForLevelFilterChange}
                        // Disable changing filiere if editing a module that already has a level.
                        // To change a module's filiere, one would typically change its level.
                        disabled={processing || (isEdit && data.level_id)}
                    >
                        <SelectTrigger id="filiere_for_level_filter" className="mt-1 w-full">
                            <SelectValue placeholder={translations?.module_form_select_filiere_placeholder || 'Select Study Field'} />
                        </SelectTrigger>
                        <SelectContent>
                            {(filieres || []).map((filiere) => (
                                <SelectItem key={filiere.id} value={filiere.id.toString()}>
                                    {filiere.nom}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* No direct error for this filter select, error will be on level_id if nothing valid is chosen */}
                </div>

                {/* Level Selector (filtered by selected Filiere) */}
                <div className="sm:col-span-1">
                    <Label htmlFor="level_id" className="text-[var(--foreground)]">
                        {translations?.module_form_level_label || 'Level'} *
                    </Label>
                    <Select
                        value={data.level_id?.toString() || ''}
                        onValueChange={(value) => setData('level_id', value ? parseInt(value, 10) : '')}
                        disabled={processing || !selectedFiliereForLevelFilter || (isEdit && data.level_id)} // Disable if no filiere selected or if editing (level change is complex)
                        required
                    >
                        <SelectTrigger id="level_id" className="mt-1 w-full">
                            <SelectValue
                                placeholder={
                                    translations?.module_form_select_level_placeholder ||
                                    (selectedFiliereForLevelFilter ? 'Select Level' : 'Select Study Field first')
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {availableLevelsForSelectedFiliere.map((level) => (
                                <SelectItem key={level.id} value={level.id.toString()}>
                                    {level.nom}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.level_id && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.level_id}</p>}
                </div>
            </div>

            {/* Module Name Input (now Combobox) */}
            <div className="mt-6">
                <Label htmlFor="nom_combobox" className="text-[var(--foreground)]">
                    {translations?.module_form_name_label || 'Module Name'} *
                </Label>
                <Combobox
                    value={data.nom} // Controlled by useForm's data.nom
                    onChange={(value) => setData('nom', value)} // Updates useForm's data.nom
                    as="div"
                    className="relative mt-1"
                >
                    <div className="relative">
                        <Combobox.Input
                            id="nom_combobox"
                            className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)] rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm" // Style like your Input
                            onChange={(event) => {
                                setModuleNameQuery(event.target.value); // Update query for filtering
                                setData('nom', event.target.value);    // Also update form data directly as user types
                            }}
                            displayValue={(moduleName) => moduleName} // How the selected value is displayed in input
                            autoComplete="off"
                            required={true} // Add your validation attributes
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <Icon icon="mdi:chevron-up-down" className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </Combobox.Button>
                    </div>
                    {filteredModuleNames.length > 0 && (
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[var(--popover)] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {filteredModuleNames.map((name, index) => ( // Using index as key if names can repeat, ideally names are unique for key
                                <Combobox.Option
                                    key={name + '-' + index} // Or generate a more stable key if possible
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                            active ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-[var(--popover-foreground)]'
                                        }`
                                    }
                                    value={name}
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {name}
                                            </span>
                                            {selected ? (
                                                <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-[var(--accent-foreground)]' : 'text-[var(--primary)]'}`}>
                                                    <Icon icon="mdi:check" className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Combobox.Option>
                            ))}
                            {/* Option to create new if query doesn't match any existing */}
                            {moduleNameQuery !== '' && !allDistinctModuleNames.includes(moduleNameQuery) && (
                                 <Combobox.Option
                                    value={moduleNameQuery} // The value is what the user typed
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                            active ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-[var(--popover-foreground)]'
                                        }`
                                    }
                                >
                                    Create "{moduleNameQuery}"
                                </Combobox.Option>
                            )}
                        </Combobox.Options>
                    )}
                </Combobox>
                {errors.nom && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.nom}</p>}
            </div>

            <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-[var(--border)] pt-6">
                <Button variant="outline" type="button" asChild>
                    <Link href={cancelRoute}>{translations?.cancel_button || 'Annuler'}</Link>
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
