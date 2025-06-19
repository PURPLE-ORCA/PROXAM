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
        // This column will now be rendered correctly by useReactTable
        accessorFn: (row) => `${row.professeur.prenom} ${row.professeur.nom}`,
        id: 'professeur_name', // It's good practice to provide a unique id for accessorFns
        header: 'Professor',
    },
    {
        // This nested key will also be rendered correctly
        accessorKey: 'professeur.service.nom',
        header: 'Service',
    },
    {
        accessorKey: 'is_responsable',
        header: 'Role',
        cell: ({ row }) => (
            row.original.is_responsable ?
                <Badge className="bg-blue-500 hover:bg-blue-500">Responsable</Badge> :
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
];
