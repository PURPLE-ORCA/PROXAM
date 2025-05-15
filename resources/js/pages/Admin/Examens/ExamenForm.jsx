import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslationContext } from '@/context/TranslationProvider';
import { Icon } from '@iconify/react'; // For remove button icon
import { Link } from '@inertiajs/react';
import { useContext, useEffect } from 'react';

export default function ExamenForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    quadrimestres, // Array of { id, display_name }
    modules, // Array of { id, nom }
    salles, // Array of { id, nom, default_capacite }
    types, // Object { 'QCM': 'QCM', ... }
    filieres, // Object { 'Medicale': 'Médicale', ... }
    isEdit = false,
    examenToEdit, // Pass the full examen object for edit mode
}) {
    const { translations } = useContext(TranslationContext);

    // State for managing selected salles and their capacities
    // data.salles_pivot should be an array of { salle_id, capacite }
    const handleSalleChange = (index, field, value) => {
        const updatedSalles = [...(data.salles_pivot || [])];
        updatedSalles[index] = { ...updatedSalles[index], [field]: value };
        if (field === 'salle_id') {
            // When salle changes, try to set default capacity
            const selectedSalle = salles.find((s) => s.id.toString() === value);
            if (selectedSalle) {
                updatedSalles[index].capacite = updatedSalles[index].capacite || selectedSalle.default_capacite.toString();
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
            },
        ]);
    };

    const removeSalleEntry = (index) => {
        const updatedSalles = [...(data.salles_pivot || [])];
        updatedSalles.splice(index, 1);
        setData('salles_pivot', updatedSalles);
    };

    useEffect(() => {
        if (isEdit && examenToEdit && examenToEdit.salles) {
            const pivotData = examenToEdit.salles.map((s) => ({
                salle_id: s.id.toString(),
                capacite: s.pivot.capacite.toString(),
            }));
            setData('salles_pivot', pivotData);
        } else if (!isEdit) {
            setData('salles_pivot', []); // Start with no salles for new exam
        }
    }, [examenToEdit, isEdit, setData]);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Section 1: Basic Exam Details */}
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
                    <Label htmlFor="module_id">{translations?.examen_form_module_label || 'Module'} *</Label>
                    <Select value={data.module_id?.toString() || ''} onValueChange={(v) => setData('module_id', v ? parseInt(v, 10) : '')} required>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder={translations?.examen_form_select_module_placeholder || 'Select Module'} />
                        </SelectTrigger>
                        <SelectContent>
                            {(modules || []).map((m) => (
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
                    <Select
                        value={data.quadrimestre_id?.toString() || ''}
                        onValueChange={(v) => setData('quadrimestre_id', v ? parseInt(v, 10) : '')}
                        required
                    >
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
                    <Label htmlFor="filiere">{translations?.examen_form_filiere_label || 'Field of Study'} *</Label>
                    <Select value={data.filiere || ''} onValueChange={(v) => setData('filiere', v)} required>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder={translations?.examen_form_select_filiere_placeholder || 'Select Field'} />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(filieres || {}).map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                    {value}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.filiere && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.filiere}</p>}
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

                <div className="sm:col-span-3">
                    <Label htmlFor="fin">{translations?.examen_form_end_datetime_label || 'End Date & Time'} *</Label>
                    <Input
                        id="fin"
                        type="datetime-local"
                        value={data.fin || ''}
                        onChange={(e) => setData('fin', e.target.value)}
                        required
                        className="mt-1"
                    />
                    {errors.fin && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.fin}</p>}
                </div>
                <div className="sm:col-span-full">
                    <Label htmlFor="required_professors">{translations?.examen_form_req_profs_label || 'Required Professors'} *</Label>
                    <Input
                        id="required_professors"
                        type="number"
                        min="1"
                        value={data.required_professors || ''}
                        onChange={(e) => setData('required_professors', e.target.value ? parseInt(e.target.value, 10) : '')}
                        required
                        className="mt-1"
                    />
                    {errors.required_professors && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.required_professors}</p>}
                </div>
            </fieldset>

            {/* Section 2: Assigned Rooms & Capacities */}
            <fieldset className="rounded-md border border-[var(--border)] p-4">
                <legend className="px-1 text-sm leading-6 font-semibold text-[var(--foreground)]">
                    {translations?.examen_form_salles_section_legend || 'Assigned Rooms & Capacities'} *
                </legend>
                {(data.salles_pivot || []).map((salleEntry, index) => (
                    <div key={index} className="mb-3 grid grid-cols-12 items-end gap-x-4">
                        <div className="col-span-6">
                            <Label htmlFor={`salle_id_${index}`}>
                                {translations?.examen_form_salle_label || 'Room'} #{index + 1}
                            </Label>
                            <Select
                                value={salleEntry.salle_id?.toString() || ''}
                                onValueChange={(value) => handleSalleChange(index, 'salle_id', value)}
                                required
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={translations?.examen_form_select_salle_placeholder || 'Select Room'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(salles || []).map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={s.id.toString()}
                                            // Disable already selected salles in other dropdowns
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
                        <div className="col-span-4">
                            <Label htmlFor={`capacite_${index}`}>
                                {translations?.examen_form_salle_capacity_override_label || 'Capacity Override'}
                            </Label>
                            <Input
                                type="number"
                                id={`capacite_${index}`}
                                min="0"
                                value={salleEntry.capacite || ''}
                                onChange={(e) => handleSalleChange(index, 'capacite', e.target.value ? parseInt(e.target.value, 10) : '')}
                                required
                                className="mt-1"
                                placeholder={translations?.examen_form_salle_capacity_placeholder || 'Enter capacity'}
                            />
                            {errors[`salles_pivot.${index}.capacite`] && (
                                <p className="mt-1 text-sm text-[var(--destructive)]">{errors[`salles_pivot.${index}.capacite`]}</p>
                            )}
                        </div>
                        <div className="col-span-2">
                            <Button type="button" variant="destructive" onClick={() => removeSalleEntry(index)} className="w-full">
                                <Icon icon="mdi:delete" className="mr-1 h-5 w-5 sm:mr-0" />
                                <span className="hidden sm:inline">{translations?.remove_button || 'Remove'}</span>
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

            {/* Submit Buttons */}
            <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-[var(--border)] pt-6">
                {/* ... Cancel and Save/Update Buttons (same as other forms) ... */}
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
