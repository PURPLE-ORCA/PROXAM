import ConfirmationModal from '@/components/Common/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useContext, useMemo, useState, useCallback } from 'react';
import { DataTable } from '@/components/DataTable';
import SimpleTableToolbar from '@/components/SimpleTableToolbar';
import { getColumns } from './columns';

export default function Index({ examens: examensPagination, filters }) {
    const { translations } = useContext(TranslationContext);
    const { auth } = usePage().props;

    const [processingAssignment, setProcessingAssignment] = useState(null);

    const breadcrumbs = useMemo(
        () => [{ title: translations?.examens_breadcrumb || 'Examinations', href: route('admin.examens.index') }],
        [translations],
    );

    const handlePaginationChange = useCallback(({ page, per_page }) => {
        router.get(route('admin.examens.index'), { page, per_page, search: filters?.search || '' }, { preserveState: true, replace: true });
    }, [filters?.search]);

    const handleSearch = useCallback((search) => {
        router.get(route('admin.examens.index'), { search, page: 1 }, { preserveState: true, replace: true });
    }, []);

    const handleTriggerAssignment = (examenId) => {
        setProcessingAssignment(examenId);
        router.post(
            route('admin.examens.trigger-assignment', { examen: examenId }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingAssignment(null),
            },
        );
    };

    const columns = useMemo(
        () => getColumns(auth, handleTriggerAssignment, processingAssignment),
        [auth, processingAssignment]
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.examens_page_title || 'Examinations'} />
            <div className="p-4 md:p-6">
                <SimpleTableToolbar
                    filters={filters}
                    onSearch={handleSearch}
                    placeholder="Filter by exam, module, or field..."
                >
                    <Button asChild>
                        <Link href={route('admin.examens.create')}>
                            {translations?.add_examen_button || 'Add Examination'}
                        </Link>
                    </Button>
                </SimpleTableToolbar>

                <DataTable
                    columns={columns}
                    data={examensPagination.data}
                    pagination={examensPagination}
                    onPaginationChange={handlePaginationChange}
                />
            </div>
            {/* The ConfirmationModal for delete can be removed from this page if it's moved to ManageAssignments */}
        </AppLayout>
    );
}
