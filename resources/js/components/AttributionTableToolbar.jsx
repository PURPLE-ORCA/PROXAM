import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from "@iconify/react";

export default function AttributionTableToolbar({ filters, onFilterChange }) {
    
    // Helper to update a specific filter value in the parent's state
    const updateFilter = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
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
        </div>
    );
}
