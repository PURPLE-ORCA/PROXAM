import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export default function SimpleTableToolbar({ filters, onSearch, children, placeholder = "Filter items..." }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                onSearch(searchTerm);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    // Sync with props
    useEffect(() => {
        setSearchTerm(filters?.search || '');
    }, [filters?.search]);

    return (
        <div className="flex items-center justify-between py-4">
            <Input
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
            {/* The "Add" button will be passed in as a child */}
            {children}
        </div>
    );
}
