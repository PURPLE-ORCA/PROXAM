import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/react';

export const getColumns = (translations, onEdit, onDelete) => [
    {
        accessorKey: 'nom',
        header: translations?.salle_name_column_header || 'Room Name',
    },
    {
        accessorKey: 'default_capacite',
        header: () => <div className="text-right">{translations?.salle_capacity_column_header || 'Default Capacity'}</div>,
        cell: ({ row }) => <div className="text-right font-medium">{row.getValue('default_capacite')}</div>,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const salle = row.original;
            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Icon icon="mdi:dots-horizontal" className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(salle)}>
                                <Icon icon="mdi:pencil-outline" className="mr-2 h-4 w-4" />
                                {translations?.edit_button_title || 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => onDelete(salle)}>
                                <Icon icon="mdi:delete-outline" className="mr-2 h-4 w-4" />
                                {translations?.delete_button_title || 'Delete'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
