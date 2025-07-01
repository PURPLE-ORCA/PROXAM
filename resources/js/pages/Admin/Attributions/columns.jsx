import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const getColumns = (attributions) => [
    {
        header: 'Exam / Module',
        cell: ({ row }) => {
            const current = row.original;
            const previous = attributions[row.index - 1];
            if (previous && current.examen_id === previous.examen_id) return null;
            return (
                <div>
                    <p className="font-medium">{current.examen.nom || `Exam ID ${current.examen_id}`}</p>
                    <p className="text-sm text-muted-foreground">{current.examen.module.nom}</p>
                </div>
            );
        },
    },
    {
        accessorFn: (row) => `${row.professeur.prenom} ${row.professeur.nom}`,
        id: 'professeur_name',
        header: 'Professor',
    },
    {
        accessorKey: 'professeur.service.nom',
        header: 'Service',
    },
    {
        accessorKey: 'is_responsable',
        header: 'Role',
        cell: ({ row }) => (
            row.original.is_responsable ?
                <Badge className="bg-[var(--fmpo)]">Responsable</Badge> :
                <Badge variant="secondary">Invigilator</Badge>
        ),
    },
    {
        header: 'Start Time',
        cell: ({ row }) => {
            const current = row.original;
            const previous = attributions[row.index - 1];
            if (previous && current.examen_id === previous.examen_id) return null;
            return format(new Date(current.examen.debut), 'dd MMM, HH:mm');
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        // The cell will be rendered manually in the Index.jsx file, so this can be empty
        cell: () => null, 
    },
];
