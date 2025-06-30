import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@iconify/react";

export default function UserTableToolbar({ filters, onFilterChange, rolesForFilter, children }) {
    
    const updateFilter = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFilterChange({ search: '', role: '', verified: '' });
    };
    
    const hasActiveFilters = filters.role || filters.verified || filters.search;

    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Filter by name or email..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="max-w-sm"
                />
                <Select value={filters.role || 'all'} onValueChange={(value) => updateFilter('role', value === 'all' ? '' : value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {(rolesForFilter || []).map(role => (
                            <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select value={filters.verified || 'all'} onValueChange={(value) => updateFilter('verified', value === 'all' ? '' : value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="true">Verified</SelectItem>
                        <SelectItem value="false">Not Verified</SelectItem>
                    </SelectContent>
                </Select>
                {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="h-9 px-2 lg:px-3">
                        Reset <Icon icon="mdi:close" className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            {children}
        </div>
    );
}
