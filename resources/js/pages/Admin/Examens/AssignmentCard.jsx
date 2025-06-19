import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useForm } from "@inertiajs/react";
import { Icon } from "@iconify/react";

export default function AssignmentCard({ salleData, examen, availableProfesseurs, onToggleResponsable, onDeleteAttribution }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        professeur_id: '',
        salle_id: salleData.id,
        is_responsable: false,
    });

    const isRoomFull = salleData.attributions.length >= salleData.required_professors;

    const addProfessor = (e) => {
        e.preventDefault();
        post(route('admin.examens.assignments.store', { examen: examen.id }), {
            onSuccess: () => reset(),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{salleData.nom}</CardTitle>
                <CardDescription>
                    {salleData.attributions.length} / {salleData.required_professors} Professors Assigned
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {salleData.attributions.map(attr => (
                            <TableRow key={attr.id}>
                                <TableCell className="font-medium">{attr.professeur.prenom} {attr.professeur.nom}</TableCell>
                                <TableCell>
                                    <Button
                                        variant={attr.is_responsable ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => onToggleResponsable(attr.id)}
                                        className={attr.is_responsable ? 'bg-blue-500' : ''}
                                    >
                                        {attr.is_responsable ? 'Responsable' : 'Invigilator'}
                                    </Button>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => onDeleteAttribution(attr)}>
                                        <Icon icon="mdi:delete" className="h-5 w-5 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!isRoomFull && (
                    <form onSubmit={addProfessor} className="mt-4 flex items-center gap-2 border-t pt-4">
                        <Select value={data.professeur_id} onValueChange={val => setData('professeur_id', val)}>
                            <SelectTrigger><SelectValue placeholder="Select Professor to Add" /></SelectTrigger>
                            <SelectContent>
                                {availableProfesseurs.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.display_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button type="submit" disabled={processing || !data.professeur_id}>Add</Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
