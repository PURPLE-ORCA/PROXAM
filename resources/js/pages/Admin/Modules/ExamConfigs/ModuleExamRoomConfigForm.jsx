import React, { useContext, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, router } from '@inertiajs/react'; // Import router
import { TranslationContext } from '@/context/TranslationProvider';

export default function ModuleExamRoomConfigForm({
    module,
    availableSalles, // This prop contains Salles NOT YET configured for THIS module
    existingConfig,
    onSubmitSuccess,
    onCancel,
}) {
    const { translations } = useContext(TranslationContext);
    const isEdit = Boolean(existingConfig);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        salle_id: existingConfig?.salle_id?.toString() || '',
        configured_capacity: existingConfig?.configured_capacity?.toString() || '',
        configured_prof_count: existingConfig?.configured_prof_count?.toString() || '1',
    });

    // This useEffect is primarily for when adding a NEW room configuration (!isEdit).
    // When the selected salle_id changes, it attempts to prefill the capacity
    // from that salle's default_capacite.
    useEffect(() => {
        if (!isEdit && data.salle_id && availableSalles) {
            const selectedSalleData = availableSalles.find(s => s.id.toString() === data.salle_id);
            if (selectedSalleData) {
                setData(prevData => ({
                    ...prevData,
                    configured_capacity: selectedSalleData.default_capacite.toString(),
                    configured_prof_count: '1', // Always default to 1 prof for a newly selected room
                }));
            }
        }
    }, [data.salle_id, isEdit, availableSalles, setData]);

    // This useEffect is to re-initialize form data when existingConfig changes (for edit mode)
    // or to reset for create mode if existingConfig becomes null.
    useEffect(() => {
        if (isEdit && existingConfig) {
            setData({
                salle_id: existingConfig.salle_id?.toString() || '',
                configured_capacity: existingConfig.configured_capacity?.toString() || '',
                configured_prof_count: existingConfig.configured_prof_count?.toString() || '1',
            });
        } else if (!isEdit) {
            // Reset for create mode, but keep salle_id if it was just selected
            // This is slightly redundant with the above useEffect for prefilling capacity,
            // but ensures a clean state if the form is re-used without unmounting.
            setData(prevData => ({
                salle_id: prevData.salle_id, // Keep if user just selected a salle
                configured_capacity: prevData.salle_id ? (availableSalles.find(s => s.id.toString() === prevData.salle_id)?.default_capacite.toString() || '') : '',
                configured_prof_count: '1',
            }));
        }
    }, [existingConfig, isEdit, setData, availableSalles]); // Note: data.salle_id removed from deps to avoid loop with above


    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...data,
            configured_capacity: parseInt(data.configured_capacity, 10) || 0,
            configured_prof_count: parseInt(data.configured_prof_count, 10) || 1,
        };

        const options = {
            onSuccess: () => { reset(); if(onSubmitSuccess) onSubmitSuccess(); },
            preserveScroll: true,
        };

        if (isEdit) {
            put(route('admin.module-exam-configs.update', { config: existingConfig.id }), submissionData, options);
        } else {
            post(route('admin.modules.exam-configs.store', { module: module.id }), submissionData, options);
        }
    };

    // For displaying the placeholder in capacity input
    const selectedSalleForPlaceholder = data.salle_id ? (availableSalles.find(s => s.id.toString() === data.salle_id) || existingConfig?.salle) : null;


    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <div>
                <Label htmlFor="salle_id_config_form">{translations?.select_room_label || 'Room'} *</Label>
                <Select
                    value={data.salle_id}
                    onValueChange={(value) => {
                        setData('salle_id', value);
                        // No need to set capacity here if the useEffect for data.salle_id handles it for !isEdit
                    }}
                    // When editing, the salle cannot be changed. User should delete and re-add.
                    disabled={isEdit || processing}
                    required
                >
                    <SelectTrigger id="salle_id_config_form" className="mt-1">
                        <SelectValue placeholder={translations?.select_room_placeholder || 'Select a Room'} />
                    </SelectTrigger>
                    <SelectContent>
                        {/* If editing, show the currently configured salle (it won't be in availableSalles) */}
                        {isEdit && existingConfig?.salle && (
                            <SelectItem value={existingConfig.salle.id.toString()}>
                                {existingConfig.salle.nom} (Default Cap: {existingConfig.salle.default_capacite})
                            </SelectItem>
                        )}
                        {/* For new configurations, show only salles not yet configured for this module */}
                        {(!isEdit && availableSalles || []).map((salle) => (
                            <SelectItem key={salle.id} value={salle.id.toString()}>
                                {salle.nom} (Default Cap: {salle.default_capacite})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.salle_id && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.salle_id}</p>}
            </div>

            <div>
                <Label htmlFor="configured_capacity_form">{translations?.configured_capacity_label || 'Configured Capacity for this Module'} *</Label>
                <Input
                    id="configured_capacity_form" type="number" min="0"
                    value={data.configured_capacity}
                    placeholder={selectedSalleForPlaceholder ? `${translations?.salle_default_capacity_short || 'Def:'} ${selectedSalleForPlaceholder.default_capacite}` : (translations?.enter_capacity_placeholder || 'Enter capacity')}
                    onChange={(e) => setData('configured_capacity', e.target.value)}
                    required className="mt-1"
                    disabled={processing}
                />
                {errors.configured_capacity && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.configured_capacity}</p>}
            </div>

            <div>
                <Label htmlFor="configured_prof_count_form">{translations?.configured_prof_count_label || 'Default Professors for this Room'} *</Label>
                <Input
                    id="configured_prof_count_form" type="number" min="1"
                    value={data.configured_prof_count}
                    onChange={(e) => setData('configured_prof_count', e.target.value)}
                    required className="mt-1"
                    disabled={processing}
                />
                {errors.configured_prof_count && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.configured_prof_count}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
                    {translations?.cancel_button || 'Cancel'}
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? (translations?.saving_button || 'Saving...') : (isEdit ? (translations?.update_button || 'Update Config') : (translations?.add_button || 'Add Config'))}
                </Button>
            </div>
        </form>
    );
}