import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Shadcn Table
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react'; 
import { useContext, useMemo, useState } from 'react';

// Small form component for adding/editing an assignment (could be a modal too)
function AttributionForm({ examen, availableProfesseurs, onSubmit, onCancel, initialData = null }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        professeur_id: initialData?.professeur_id || '',
        is_responsable: initialData?.is_responsable || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (initialData) {
            // Editing (though we only toggle responsable via separate action for now)
            // This form is mainly for adding new. Edit could be just toggling.
        } else {
            // Creating
            onSubmit(route('admin.examens.assignments.store', { examen: examen.id }), data, {
                onSuccess: () => {
                    reset();
                    onCancel();
                },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-md border bg-[var(--card)] p-4">
            <h3 className="text-lg font-medium text-[var(--card-foreground)]">{translations?.add_new_assignment_title || 'Add New Assignment'}</h3>
            <div>
                <Label htmlFor="professeur_id">{translations?.select_professor_label || 'Professor'} *</Label>
                <Select
                    value={data.professeur_id?.toString()}
                    onValueChange={(value) => setData('professeur_id', value ? parseInt(value, 10) : '')}
                    required
                >
                    <SelectTrigger className="mt-1">
                        <SelectValue placeholder={translations?.select_professor_placeholder || 'Select Professor'} />
                    </SelectTrigger>
                    <SelectContent>
                        {(availableProfesseurs || []).map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                                {p.display_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.professeur_id && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.professeur_id}</p>}
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="is_responsable_form"
                    checked={data.is_responsable}
                    onCheckedChange={(checked) => setData('is_responsable', Boolean(checked))}
                />
                <Label htmlFor="is_responsable_form">{translations?.is_responsable_label || 'Is Responsable?'}</Label>
            </div>
            {errors.is_responsable && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.is_responsable}</p>}
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    {translations?.cancel_button || 'Cancel'}
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? translations?.saving_button || 'Saving...' : translations?.add_button || 'Add'}
                </Button>
            </div>
        </form>
    );
}

export default function ManageAssignments({ examen, currentAttributions, availableProfesseurs }) {
    const { translations } = useContext(TranslationContext);
    const { auth, flash } = usePage().props; // For permissions and flash messages

    const [showAddForm, setShowAddForm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // For delete confirmation
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const breadcrumbs = useMemo(
        () => [
            { title: translations?.examens_breadcrumb || 'Examinations', href: route('admin.examens.index') },
            { title: examen?.nom || `Exam ID ${examen?.id}`, href: route('admin.examens.edit', { examen: examen?.id }) }, // Link back to exam edit
            { title: translations?.manage_assignments_breadcrumb || 'Manage Assignments' },
        ],
        [translations, examen],
    );

    const handleToggleResponsable = (attributionId) => {
        router.put(
            route('admin.attributions.toggle-responsable', { attribution: attributionId }),
            {},
            {
                preserveScroll: true,
                // onSuccess: () => { /* Flash message will handle feedback */ }
            },
        );
    };

    const openDeleteAttributionModal = (attribution) => {
        setItemToDelete(attribution);
        setIsDeleteModalOpen(true);
    };
    const confirmDeleteAttribution = () => {
        if (itemToDelete) {
            router.delete(route('admin.attributions.destroy_manual', { attribution: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => setIsDeleteModalOpen(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${translations?.manage_assignments_page_title || 'Manage Assignments for'} ${examen?.nom || `Exam ID ${examen?.id}`}`} />

            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-[var(--foreground)]">
                        {translations?.manage_assignments_heading || 'Manage Assignments for:'} {examen?.nom || `Exam ID ${examen?.id}`}
                        <span className="block text-sm text-[var(--muted-foreground)]">
                            ({translations?.module_label || 'Module'}: {examen?.module?.nom || 'N/A'}, {formatDate(examen?.debut)})
                        </span>
                    </h1>
                    {currentAttributions.length < examen.required_professors && (auth.abilities?.is_admin || auth.abilities?.is_rh) && (
                        <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
                            {translations?.add_new_assignment_button || 'Add New Assignment'}
                        </Button>
                    )}
                </div>

                {showAddForm && (
                    <AttributionForm
                        examen={examen}
                        availableProfesseurs={availableProfesseurs}
                        onSubmit={(url, formData, options) => router.post(url, formData, options)}
                        onCancel={() => setShowAddForm(false)}
                    />
                )}

                <div className="mt-6 rounded-lg bg-[var(--card)] shadow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{translations?.professor_name_header || 'Professor'}</TableHead>
                                <TableHead>{translations?.role_header || 'Role'}</TableHead>
                                <TableHead className="text-right">{translations?.actions_header || 'Actions'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentAttributions.length > 0 ? (
                                currentAttributions.map((attribution) => (
                                    <TableRow key={attribution.id}>
                                        <TableCell>
                                            {attribution.professeur?.prenom} {attribution.professeur?.nom}
                                            <span className="block text-xs text-[var(--muted-foreground)]">
                                                {attribution.professeur?.user?.email}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant={attribution.is_responsable ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleToggleResponsable(attribution.id)}
                                                className={attribution.is_responsable ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                                            >
                                                {attribution.is_responsable
                                                    ? translations?.attribution_role_responsable || 'Responsable'
                                                    : translations?.attribution_role_invigilator || 'Invigilator'}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDeleteAttributionModal(attribution)}
                                                className="text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/10"
                                            >
                                                <Icon icon="mdi:delete" className="h-5 w-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-[var(--muted-foreground)]">
                                        {translations?.no_assignments_yet || 'No professors assigned to this exam yet.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteAttribution}
                title={translations?.delete_assignment_modal_title || 'Delete Assignment'}
                message={
                    itemToDelete
                        ? (
                              translations?.assignment_delete_confirmation || 'Are you sure you want to remove professor {profName} from this exam?'
                          ).replace('{profName}', `${itemToDelete.professeur?.prenom} ${itemToDelete.professeur?.nom}`)
                        : translations?.generic_delete_confirmation
                }
                confirmText={translations?.delete_button_title || 'Delete'}
            />
        </AppLayout>
    );
}

// Helper formatDate from Examens/Index.jsx if needed here again, or import from a shared util
const formatDate = (datetimeString) => {
    if (!datetimeString) return 'N/A';
    try {
        return new Date(datetimeString).toLocaleString(undefined, {
            // Use browser default locale
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        return datetimeString;
    }
};
