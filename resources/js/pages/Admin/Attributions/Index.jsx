import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import { getColumns } from './columns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import AttributionTableToolbar from '@/components/AttributionTableToolbar'; // <-- Import our new toolbar

export default function Index({ attributions: attributionsPagination, filters }) {
    
    const [activeFilters, setActiveFilters] = useState({
        search: filters.search || '',
        prof_search: filters.prof_search || '',
        service_search: filters.service_search || '',
        page: attributionsPagination.current_page,
    });

    const columns = useMemo(() => getColumns(attributionsPagination.data), [attributionsPagination.data]);

    // A single debounced effect for all filters
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentParams = route().params;
            const newParams = { ...currentParams, ...activeFilters };
            router.get(route('admin.attributions.index'), newParams, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [activeFilters]);
    
    // A single handler for the toolbar to call
    const handleFilterChange = (newFilters) => {
        setActiveFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const table = useReactTable({
        data: attributionsPagination.data,
        columns,
        manualPagination: true,
        rowCount: attributionsPagination.total,
        state: {
            pagination: {
                pageIndex: attributionsPagination.current_page - 1,
                pageSize: attributionsPagination.per_page,
            },
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <AppLayout>
            <Head title="Exam Assignments" />
            <div className="p-4 md:p-6">
                <AttributionTableToolbar
                    filters={activeFilters}
                    onFilterChange={handleFilterChange}
                />
                
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => {
                                    const isFirstInGroup = row.index === 0 || row.original.examen_id !== table.getRowModel().rows[row.index - 1].original.examen_id;
                                    return (
                                        <TableRow key={row.id} className={isFirstInGroup && row.index > 0 ? 'border-t-2 border-border' : ''}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">No assignments found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button variant="outline" size="sm" onClick={() => router.get(attributionsPagination.prev_page_url)} disabled={!attributionsPagination.prev_page_url}>Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => router.get(attributionsPagination.next_page_url)} disabled={!attributionsPagination.next_page_url}>Next</Button>
                </div>
            </div>
        </AppLayout>
    );
}
