import axios from 'axios';
import ConfirmationModal from '@/components/Common/ConfirmationModal';
import ImportModal from '@/components/ImportModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Icon } from '@iconify/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import ProfessorModal from './ProfessorModal';
import { useContext, useEffect, useMemo, useState } from 'react';

const statutColors = {
    Active: 'bg-green-500 hover:bg-green-600',
    On_Leave: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    Sick_Leave: 'bg-orange-500 hover:bg-orange-600',
    Vacation: 'bg-blue-500 hover:bg-blue-600',
    Inactive: 'bg-gray-500 hover:bg-gray-600',
    default: 'bg-gray-400 hover:bg-gray-500',
};

const defaultPageSize = 15;
const defaultPageIndex = 0;

export default function Index({
    professeurs: professeursPagination,
    filters,
    servicesForFilter,
    rangsForFilter,
    statutsForFilter,
    servicesForForm,
    modulesForForm,
    rangsForForm,
    statutsForForm,
    existingSpecialtiesForForm,
}) {
    const { translations, language } = useContext(TranslationContext);
    const { auth } = usePage().props;   

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [isProfessorModalOpen, setProfessorModalOpen] = useState(false);
    const [professorToEdit, setProfessorToEdit] = useState(null);

    const openCreateModal = () => {
        setProfessorToEdit(null); // Clear any previous edit data
        setProfessorModalOpen(true);
    };

    const openEditModal = (professeur) => {
        // Fetch the full professor data, including modules
        axios.get(route('admin.professeurs.show', { professeur: professeur.id }))
            .then(response => {
                // Now we have the full data, including the `modules` array
                const fullProfessorData = response.data;
                setProfessorToEdit(fullProfessorData);
                setProfessorModalOpen(true);
            })
            .catch(error => {
                console.error("Failed to fetch full professor data:", error);
                // Optionally show an error toast to the user
            });
    };

    const getStatutTranslation = (statutKey) => {
        if (!statutKey) return translations?.statut_undefined || 'N/A';
        const translationKey = `professeur_statut_${statutKey.replace('_', '').toLowerCase()}`;
        return translations?.[translationKey] || statutKey.replace('_', ' ');
    };

    const getRangTranslation = (rangKey) => {
        if (!rangKey) return 'N/A';
        const translationKey = `professeur_rang_${rangKey.toLowerCase()}`;
        return translations?.[translationKey] || rangKey;
    };

    const breadcrumbs = useMemo(
        () => [{ title: translations?.professeurs_breadcrumb || 'Professors', href: route('admin.professeurs.index') }],
        [translations],
    );

    const [pagination, setPagination] = useState({
        pageIndex: professeursPagination.current_page - 1 ?? defaultPageIndex,
        pageSize: professeursPagination.per_page ?? defaultPageSize,
    });

    // State for all filters
    const [globalFilter, setGlobalFilter] = useState(filters?.search || '');
    const [columnFilters, setColumnFilters] = useState(filters?.filters ? Object.entries(filters.filters).map(([id, value]) => ({id, value})) : []);

    // Debounce effect for filtering
    useEffect(() => {
        const timeout = setTimeout(() => {
            const parsedColumnFilters = columnFilters.reduce((acc, filter) => {
                acc[filter.id] = filter.value;
                return acc;
            }, {});

            router.get(
                route('admin.professeurs.index'),
                {
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize,
                    search: globalFilter || undefined,
                    filters: parsedColumnFilters, // Send the new column filters
                },
                { preserveState: true, replace: true }
            );
        }, 500); // 500ms delay after user stops typing

        return () => clearTimeout(timeout);
    }, [pagination, globalFilter, columnFilters]);

    const columns = useMemo(
        () => [
            {
                accessorFn: (row) => `${row.prenom} ${row.nom}`,
                id: 'fullName',
                header: translations?.professeur_name_column_header || 'Name',
                size: 200,
                // Default filter is 'text' input
            },
            { accessorKey: 'user.email', header: translations?.user_email_column_header || 'Email', size: 250 },
            { accessorKey: 'service.nom', header: translations?.professeur_service_column_header || 'Service', size: 150, filterVariant: 'text' },
            {
                accessorKey: 'rang',
                header: translations?.professeur_rank_column_header || 'Rank',
                Cell: ({ cell }) => getRangTranslation(cell.getValue()),
                size: 100,
                filterVariant: 'select', // Use a dropdown for this
                filterSelectOptions: Object.entries(rangsForFilter).map(([key, value]) => ({ value: key, text: value })),
            },
            {
                accessorKey: 'statut',
                header: translations?.professeur_status_column_header || 'Status',
                Cell: ({ cell }) => {
                    const statut = cell.getValue();
                    const colorClass = statut ? statutColors[statut] || statutColors.default : statutColors.default;
                    return <Badge className={`${colorClass} text-white`}>{getStatutTranslation(statut)}</Badge>;
                },
                size: 120,
                filterVariant: 'select', // Use a dropdown for this
                filterSelectOptions: Object.entries(statutsForFilter).map(([key, value]) => ({ value: key, text: value })),
            },
            { accessorKey: 'specialite', header: translations?.professeur_specialty_column_header || 'Specialty', size: 150 },

            {
                accessorKey: 'date_recrutement',
                header: 'Recruitment',
                size: 150,
                Cell: ({ cell }) => {
                    const date = cell.getValue();
                    if (!date) return 'N/A';
                    // Format the ISO string into a more readable date
                    return format(new Date(date), 'dd/MM/yyyy');
                },
            },
            {
                accessorKey: 'is_chef_service',
                header: translations?.professeur_is_head_column_header || 'Head',
                Cell: ({ cell }) =>
                    cell.getValue() ? (
                        <Icon icon="mdi:check-circle" className="mx-auto h-5 w-5 text-green-500" />
                    ) : (
                        <Icon icon="mdi:close-circle" className="mx-auto h-5 w-5 text-gray-400" />
                    ),
                size: 80,
                muiTableBodyCellProps: { align: 'center' },
                muiTableHeadCellProps: { align: 'center' },
            },
        ],
        [translations, language, rangsForFilter, statutsForFilter],
    );

    const openDeleteModal = (professeurItem) => {
        setItemToDelete(professeurItem);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsModalOpen(false);
        setItemToDelete(null);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('admin.professeurs.destroy', { professeur: itemToDelete.id }), {
                preserveScroll: true,
                onSuccess: () => closeDeleteModal(),
                onError: () => closeDeleteModal(),
            });
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: professeursPagination.data || [],
        manualPagination: true,
        manualFiltering: true, // IMPORTANT: Tells MRT we are handling filtering on the server
        enableColumnFilters: true,
        onGlobalFilterChange: setGlobalFilter, // For the top search bar
        onColumnFiltersChange: setColumnFilters, // For per-column filters
        state: {
            pagination,
            globalFilter, // Wire up the states
            columnFilters,
        },
        rowCount: professeursPagination.total,
        onPaginationChange: setPagination,
        enableEditing: auth.abilities?.is_admin,
        enableRowActions: auth.abilities?.is_admin,
        // --- 2. ADD THIS PROPERTY ---
        positionActionsColumn: 'last',
        // -------------------------
        
        muiTablePaperProps: {
            elevation: 0,
            sx: { borderRadius: 'var(--radius-md)', backgroundColor: 'var(--background)', '.dark &': { backgroundColor: 'var(--background)' } },
        },
        muiTableHeadCellProps: {
            sx: {
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                fontWeight: '600',
                borderBottomWidth: '2px',
                borderColor: 'var(--border)',
                '& .MuiSvgIcon-root': { color: 'var(--foreground)' },
                '.dark &': {
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)',
                    '& .MuiSvgIcon-root': { color: 'var(--foreground)' },
                },
            },
        },
        muiTableBodyCellProps: {
            sx: {
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderBottom: '1px solid var(--border)',
                '.dark &': { backgroundColor: 'var(--background)', color: 'var(--foreground)', borderBottom: '1px solid var(--border)' },
            },
        },
        muiTableBodyRowProps: {
            sx: {
                backgroundColor: 'transparent',
                '&:hover td': { backgroundColor: 'var(--accent)', '.dark &': { backgroundColor: 'var(--accent)' } },
            },
        },
        muiTopToolbarProps: {
            sx: {
                backgroundColor: 'var(--background)',
                borderBottom: '1px solid var(--border)',
                '& .MuiIconButton-root, & .MuiSvgIcon-root, & .MuiInputBase-input': { color: 'var(--foreground)' },
                '.dark &': {
                    backgroundColor: 'var(--background)',
                    borderBottom: '1px solid var(--border)',
                    '& .MuiIconButton-root, & .MuiSvgIcon-root, & .MuiInputBase-input': { color: 'var(--foreground)' },
                },
            },
        },
        muiBottomToolbarProps: {
            sx: {
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderTop: '1px solid var(--border)',
                '& .MuiIconButton-root:not([disabled]), & .MuiSvgIcon-root': { color: 'var(--foreground)' },
                '& .Mui-disabled': { opacity: 0.5 },
                '.dark &': {
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderTop: '1px solid var(--border)',
                    '& .MuiIconButton-root:not([disabled]), & .MuiSvgIcon-root': { color: 'var(--foreground)' },
                },
            },
        },


        // --- 3. REPLACE THIS ENTIRE FUNCTION ---
        renderRowActions: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <Icon icon="mdi:dots-horizontal" className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => openEditModal(row.original)}>
                        <Icon icon="mdi:pencil-outline" className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {auth.user?.id !== row.original.user?.id && (
                         <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => openDeleteModal(row.original)}>
                            <Icon icon="mdi:delete-outline" className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        
        renderTopToolbarCustomActions: () => (
            <div className="flex gap-2">
                <Button onClick={openCreateModal}>Add Professor</Button>
                <Button
                    variant="outline"
                    onClick={() => setIsImportModalOpen(true)}
                    className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
                >
                    <Icon icon="mdi:upload" className="mr-2 h-5 w-5" />
                    {translations?.import_professors_button || 'Import from File'}
                </Button>
            </div>
        ),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.professeurs_page_title || 'Professors List'} />
            <div className="bg-[var(--background)] p-4 text-[var(--foreground)] md:p-6">
                <MaterialReactTable table={table} />
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={translations?.delete_professeur_modal_title || 'Delete Professor'}
                message={
                    itemToDelete
                        ? (
                              translations?.professeur_delete_confirmation ||
                              'Are you sure you want to delete the professor "{name}"? This will also delete their user account.'
                          ).replace('{name}', `${itemToDelete.prenom} ${itemToDelete.nom}`)
                        : translations?.generic_delete_confirmation || 'Are you sure you want to delete this item?'
                }
                confirmText={translations?.delete_button_title || 'Delete'}
            />
            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
            />

            {/* --- RENDER OUR NEW MODAL --- */}
            <ProfessorModal
                isOpen={isProfessorModalOpen}
                onClose={() => setProfessorModalOpen(false)}
                professeur={professorToEdit}
                // Pass all the necessary data for the form dropdowns
                services={servicesForForm}
                modules={modulesForForm}
                rangs={rangsForForm}
                statuts={statutsForForm}
                existingSpecialties={existingSpecialtiesForForm}
            />
        </AppLayout>
    );
}
