import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/react';
import { format } from 'date-fns';

export const getColumns = (onEdit, onDelete) => [
    {
        accessorFn: (row) => `${row.professeur.prenom} ${row.professeur.nom}`,
        id: 'professeurName',
        header: 'Professor',
    },
    {
        accessorKey: 'start_datetime',
        header: 'Start Time',
        cell: ({ row }) => format(new Date(row.original.start_datetime), 'dd MMM yyyy, HH:mm'),
    },
    {
        accessorKey: 'end_datetime',
        header: 'End Time',
        cell: ({ row }) => format(new Date(row.original.end_datetime), 'dd MMM yyyy, HH:mm'),
    },
    {
        accessorKey: 'reason',
        header: 'Reason',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const unavailability = row.original;
            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><Icon icon="mdi:dots-horizontal" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(unavailability)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(unavailability)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
