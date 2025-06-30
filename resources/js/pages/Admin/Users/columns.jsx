import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Icon } from '@iconify/react';

// New component for sortable headers
const SortableHeader = ({ column, children }) => (
    <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4 h-8"
    >
        {children}
        {column.getIsSorted() === 'asc' && <Icon icon="mdi:arrow-up" className="ml-2 h-4 w-4" />}
        {column.getIsSorted() === 'desc' && <Icon icon="mdi:arrow-down" className="ml-2 h-4 w-4" />}
    </Button>
);

const roleColors = {
    admin: 'bg-red-500',
    rh: 'bg-blue-500',
    professeur: 'bg-green-500',
    chef_service: 'bg-yellow-500',
};

export const getColumns = (auth, onEdit, onDelete) => [
    { accessorKey: 'name', header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader> },
    { accessorKey: 'email', header: ({ column }) => <SortableHeader column={column}>Email</SortableHeader> },
    {
        accessorKey: 'role',
        header: ({ column }) => <SortableHeader column={column}>Role</SortableHeader>,
        cell: ({ row }) => {
            const role = row.getValue('role');
            return <Badge className={`capitalize ${roleColors[role]}`}>{role}</Badge>;
        }
    },
    {
        accessorKey: 'email_verified_at',
        header: ({ column }) => <SortableHeader column={column}>Verified</SortableHeader>,
        cell: ({ row }) => {
            const verified = row.getValue('email_verified_at');
            return verified ? (
                <Badge variant="secondary" className="bg-green-500 text-white">
                    Verified
                </Badge>
            ) : (
                <Badge variant="secondary" className="bg-red-500 text-white">
                    Not Verified
                </Badge>
            );
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const user = row.original;
            if (user.id === auth.user.id) return null; // Can't edit or delete self

            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><Icon icon="mdi:dots-horizontal" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(user)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(user)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
