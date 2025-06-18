import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/react';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';

export const getColumns = (auth, handleTriggerAssignment, processingAssignment) => [
    {
        accessorKey: 'nom',
        header: 'Exam Name',
    },
    {
        accessorKey: 'module.nom',
        header: 'Module Name',
    },
    {
        accessorKey: 'quadrimestre',
        header: 'Semester Code',
        cell: ({ row }) => {
            const q = row.original.quadrimestre;
            return q ? `${q.seson?.annee_uni?.annee} - ${q.seson?.code} - ${q.code}` : 'N/A';
        },
    },
    {
        accessorKey: 'type',
        header: 'Type',
    },
    {
        accessorKey: 'debut',
        header: 'Start Time',
        cell: ({ row }) => format(new Date(row.original.debut), 'dd MMM yyyy, HH:mm'),
    },
    {
        accessorKey: 'attributions_count',
        header: 'Assigned',
        cell: ({ row }) => <div className="text-center">{row.original.attributions_count}</div>,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const examen = row.original;
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
                             <DropdownMenuItem asChild>
                                <Link href={route('admin.examens.assignments.index', { examen: examen.id })}>
                                    <Icon icon="mdi:eye-outline" className="mr-2 h-4 w-4" /> Manage Assignments
                                </Link>
                            </DropdownMenuItem>
                            {(auth.abilities?.is_admin) && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href={route('admin.examens.edit', { examen: examen.id })}>
                                            <Icon icon="mdi:pencil-outline" className="mr-2 h-4 w-4" /> Edit Exam
                                        </Link>
                                    </DropdownMenuItem>
                                    {examen.attributions_count < examen.required_professors && (
                                        <DropdownMenuItem onClick={() => handleTriggerAssignment(examen.id)}>
                                            {processingAssignment === examen.id ? (
                                                <Icon icon="mdi:loading" className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Icon icon="mdi:robot-outline" className="mr-2 h-4 w-4" />
                                            )}
                                            Auto-Assign
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
