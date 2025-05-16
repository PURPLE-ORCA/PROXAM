import { Badge } from '@/components/ui/badge'; // For 'Responsable' badge
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useContext, useEffect, useMemo, useState } from 'react';
// No create button for attributions from this index page usually

const defaultPageSize = 20; // Can be higher for purely informational tables
const defaultPageIndex = 0;

export default function Index({ attributions: attributionsPagination, filters, sesonsForFilter }) {
    const { translations, language } = useContext(TranslationContext);
    const { auth } = usePage().props;

    const formatDate = (datetimeString) => {
        if (!datetimeString) return 'N/A';
        try {
            return new Date(datetimeString).toLocaleString(language, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return datetimeString;
        }
    };

    const breadcrumbs = useMemo(
        () => [{ title: translations?.attributions_breadcrumb || 'Exam Assignments', href: route('admin.attributions.index') }],
        [translations],
    );

    const [pagination, setPagination] = useState({
        pageIndex: attributionsPagination.current_page - 1 ?? defaultPageIndex,
        pageSize: attributionsPagination.per_page ?? defaultPageSize,
    });

    // Add states for filters if you implement them in the toolbar
    const [examenSearch, setExamenSearch] = useState(filters?.search_examen || '');
    const [professeurSearch, setProfesseurSearch] = useState(filters?.search_professeur || '');
    const [selectedSeson, setSelectedSeson] = useState(filters?.seson_id || '');

    useEffect(() => {
        // This effect handles pagination, actual filtering would trigger a separate router.get
        if (pagination.pageIndex !== attributionsPagination.current_page - 1 || pagination.pageSize !== attributionsPagination.per_page) {
            router.get(
                route('admin.attributions.index'),
                {
                    page: pagination.pageIndex + 1,
                    per_page: pagination.pageSize,
                    search_examen: filters?.search_examen || '', // Preserve existing filters
                    search_professeur: filters?.search_professeur || '',
                    seson_id: filters?.seson_id || '',
                },
                { preserveState: true, replace: true, preserveScroll: true },
            );
        }
    }, [pagination.pageIndex, pagination.pageSize, attributionsPagination, filters]);

    const columns = useMemo(
        () => [
            {
                accessorFn: (row) => row.examen?.nom || `Exam ID ${row.examen_id}`,
                id: 'examen_nom',
                header: translations?.attribution_examen_name_column_header || 'Exam',
                size: 200,
            },
            {
                accessorKey: 'examen.module.nom',
                header: translations?.module_name_column_header || 'Module', // Re-use
                size: 150,
            },
            {
                accessorFn: (row) => `${row.professeur?.prenom || ''} ${row.professeur?.nom || 'N/A'}`,
                id: 'professeurFullName',
                header: translations?.attribution_professeur_column_header || 'Professor',
                size: 200,
            },
            {
                accessorKey: 'professeur.service.nom',
                header: translations?.professeur_service_column_header || 'Service', // Re-use
                size: 150,
            },
            {
                accessorKey: 'is_responsable',
                header: translations?.attribution_role_column_header || 'Role',
                Cell: ({ cell }) =>
                    cell.getValue() ? (
                        <Badge className="bg-blue-500 text-white">{translations?.attribution_role_responsable || 'Responsable'}</Badge>
                    ) : (
                        <Badge variant="secondary">{translations?.attribution_role_invigilator || 'Invigilator'}</Badge>
                    ),
                size: 120,
                muiTableBodyCellProps: { align: 'center' },
                muiTableHeadCellProps: { align: 'center' },
            },
            {
                accessorKey: 'examen.debut',
                header: translations?.examen_start_time_column_header || 'Exam Start', // Re-use
                Cell: ({ cell }) => formatDate(cell.getValue()),
                size: 180,
            },
            {
                accessorKey: 'examen.quadrimestre.seson.annee_uni.annee',
                header: translations?.annee_uni_year_column_header || 'Academic Year',
                size: 120,
            },
            {
                accessorKey: 'examen.quadrimestre.seson.code',
                header: translations?.seson_code_column_header || 'Session',
                size: 100,
            },
        ],
        [translations, language],
    );

    // No create/edit/delete actions directly on this table for now
    // Admin overrides for specific exam assignments would likely be on an Exam's detail/edit page
    // or a dedicated "Manual Assignment Override" interface.

    const table = useMaterialReactTable({
        columns,
        data: attributionsPagination.data || [],
        manualPagination: true,
        state: { pagination },
        rowCount: attributionsPagination.total,
        onPaginationChange: setPagination,
        enableRowActions: false, // No row actions like edit/delete for now
        enableEditing: false,

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
                    border_bottom: '1px solid var(--border)',
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

        // TODO: Implement renderTopToolbarCustomActions for filter inputs (Exam Search, Prof Search, Seson Select)
        // These inputs would update local state (e.g., examenSearch, professeurSearch, selectedSeson)
        // and a "Filter" button or onBlur/onChange (debounced) would trigger:
        // router.get(route('admin.attributions.index'), { search_examen: ..., search_professeur: ..., seson_id: ... }, { preserveState: true, replace: true })
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.attributions_page_title || 'Exam Assignments'} />
            <div className="bg-[var(--background)] p-4 text-[var(--foreground)] md:p-6">
                <MaterialReactTable table={table} />
            </div>
            {/* No ConfirmationModal needed here as there are no delete actions on this page yet */}
        </AppLayout>
    );
}
