import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import ProfesseurForm from './ProfesseurForm';

export default function ProfessorModal({ isOpen, onClose, professeur, services, modules, rangs, statuts, existingSpecialties }) {
    const isEdit = !!professeur;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        // ... (your useForm initial state is correct)
        professeur_nom: '',
        professeur_prenom: '',
        email: '',
        password: '',
        rang: '',
        statut: '',
        is_chef_service: false,
        date_recrutement: '',
        specialite: '',
        service_id: '',
        module_names: [], // Use module_names instead of module_ids
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            setData({
                professeur_nom: professeur?.nom || '',
                professeur_prenom: professeur?.prenom || '',
                email: professeur?.user?.email || '',
                password: '',
                rang: professeur?.rang || '',
                statut: professeur?.statut || '',
                is_chef_service: professeur?.is_chef_service || false,
                date_recrutement: professeur?.date_recrutement ? professeur.date_recrutement.split('T')[0] : '',
                specialite: professeur?.specialite || '',
                service_id: professeur?.service_id?.toString() || '',
                module_names: professeur?.modules?.map(m => m.nom) || [], // Map to an array of names
            });
        }
    }, [isOpen, professeur]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('admin.professeurs.update', professeur.id), { preserveScroll: true, onSuccess: onClose });
        } else {
            post(route('admin.professeurs.store'), { preserveScroll: true, onSuccess: onClose });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="min-w-2xl flex flex-col max-h-[90vh]">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>{isEdit ? 'Edit Professor' : 'New Professor'}</DialogTitle>
                </DialogHeader>

                <div className="flex-grow overflow-y-auto pr-6 -mr-6">
                    <ProfesseurForm
                        isEdit={isEdit}
                        data={data}
                        setData={setData}
                        errors={errors}
                        services={services}
                        modules={modules}
                        rangs={rangs}
                        statuts={statuts}
                        existingSpecialties={existingSpecialties}
                    />
                </div>

                <DialogFooter className="flex-shrink-0 pt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleSubmit} disabled={processing}>
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
