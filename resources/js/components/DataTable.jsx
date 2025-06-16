import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useEffect, useState } from 'react';

export function DataTable({ columns, data, pagination, onPaginationChange, onSearch, filters, children }) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        rowCount: pagination.total,
        state: {
            pagination: {
            pageIndex: pagination.current_page - 1,
                pageSize: pagination.per_page,
            },
        },
        onPaginationChange: (updater) => {
            const newPage = typeof updater === 'function' ? updater({ pageIndex: pagination.current_page - 1, pageSize: pagination.per_page }) : updater;
            onPaginationChange({ page: newPage.pageIndex + 1, per_page: newPage.pageSize });
        },
    });

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    // --- DEBOUNCING LOGIC (This part is fine) ---
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only fire search if the local term is different from the one in the URL
            if (searchTerm !== (filters?.search || '')) {
                onSearch(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]); // Simplified dependencies

    // --- CRITICAL FIX: SYNC STATE WITH PROPS ---
    // This effect runs whenever the filters from the URL change (e.g., after a search completes).
    useEffect(() => {
        setSearchTerm(filters?.search || '');
    }, [filters?.search]);
    // --- END CRITICAL FIX ---

    return (
        <div>
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Filter services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                {children}
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
