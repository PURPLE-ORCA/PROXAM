import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from "@iconify/react";
// We no longer need Inertia's Link for this
// import { Link } from '@inertiajs/react';

export default function AttributionTableToolbar({ filters, onFilterChange }) {
    
    // Helper to update a specific filter value in the parent's state
    const updateFilter = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    // --- THE NEW DOWNLOAD HANDLER ---
    const handleExport = () => {
        // Build the query string from the filters object
        const queryParams = new URLSearchParams(filters).toString();
        
        // Construct the full URL. We use `route().tostring()` to get the base URL
        // without making an Inertia call.
        const url = `${route('admin.attributions.export').toString()}?${queryParams}`;

        // This is the brute-force download part.
        // Create a temporary link element.
        const link = document.createElement('a');
        link.href = url;
        // The `download` attribute can suggest a filename, but we'll rely on the server's header.
        // link.setAttribute('download', 'assignments.xlsx'); 
        
        // Append to the body, click it, then remove it.
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearFilters = () => {
        onFilterChange({ search: '', prof_search: '', service_search: '' });
    }
    
    const hasActiveFilters = filters.search || filters.prof_search || filters.service_search;

    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Filter by Exam/Module..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="h-9 w-full sm:w-auto"
                />
                <Input
                    placeholder="Filter by Professor..."
                    value={filters.prof_search || ''}
                    onChange={(e) => updateFilter('prof_search', e.target.value)}
                    className="h-9 w-full sm:w-auto"
                />
                <Input
                    placeholder="Filter by Service..."
                    value={filters.service_search || ''}
                    onChange={(e) => updateFilter('service_search', e.target.value)}
                    className="h-9 w-full sm:w-auto"
                />
                {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="h-9 px-2 lg:px-3">
                        Reset
                        <Icon icon="mdi:close" className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* --- REPLACE THE <Link> WITH A <Button> --- */}
            <Button onClick={handleExport}>
                <Icon icon="mdi:file-excel-outline" className="mr-2 h-4 w-4" />
                Export to Excel
            </Button>
        </div>
    );
}
