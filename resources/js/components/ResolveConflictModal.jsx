import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useEffect, useState } from "react";
import axios from "axios";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { router } from '@inertiajs/react';

export default function ResolveConflictModal({ isOpen, setIsOpen, attributionId }) {
    const [professors, setProfessors] = useState([]);
    const [selectedProfessorId, setSelectedProfessorId] = useState(null);

    useEffect(() => {
        if (isOpen && attributionId) {
            axios.get(`/admin/attributions/${attributionId}/find-replacements`)
                .then(response => {
                    setProfessors(response.data);
                })
                .catch(error => {
                    console.error("Error fetching replacements:", error);
                });
        }
    }, [isOpen, attributionId]);

    const handleConfirm = () => {
        router.put(`/admin/attributions/${attributionId}/reassign`, { new_professeur_id: selectedProfessorId }, {
            onSuccess: () => {
                setIsOpen(false);
            },
        });
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Resolve Conflict</AlertDialogTitle>
                    <AlertDialogDescription>
                        Select a professor to replace the current one.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <RadioGroup value={selectedProfessorId} onValueChange={setSelectedProfessorId}>
                    {professors.map((professor) => (
                        <div key={professor.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={professor.id.toString()} id={`professor-${professor.id}`} />
                            <label
                                htmlFor={`professor-${professor.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {professor.prenom} {professor.nom}
                            </label>
                        </div>
                    ))}
                </RadioGroup>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
