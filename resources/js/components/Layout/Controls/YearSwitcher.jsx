import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Icon } from '@iconify/react';
import { router } from '@inertiajs/react';

export default function YearSwitcher({ academicYear, translations }) {
    const handleAcademicYearChange = (yearIdString) => {
        const yearId = parseInt(yearIdString, 10);
        if (yearId && yearId !== academicYear.selected_id) {
            router.post(route('admin.academic-year.select'), { annee_uni_id: yearId }, { preserveScroll: true });
        }
    };

    if (!academicYear?.all?.length) return null;

    return (
        <Select value={academicYear.selected_id?.toString() || ''} onValueChange={handleAcademicYearChange}>
            <SelectTrigger className="h-10 w-auto min-w-[180px] border-border bg-transparent px-3 py-2 text-sm text-[var(--fmpo)] shadow-sm focus:ring-1 focus:ring-[var(--ring)]">
                <div className="flex items-center gap-2">
                    <Icon icon="mdi:calendar-blank-outline" className="h-4 w-4" />
                    <SelectValue placeholder={translations?.select_academic_year_placeholder || 'Select Year'} />
                </div>
            </SelectTrigger>
            <SelectContent>
                {academicYear.all.map((year) => (
                    <SelectItem key={year.id} value={year.id.toString()}>
                        {year.annee}
                        {academicYear.current && year.id === academicYear.current.id && (
                            <span className="ml-2 text-xs text-[var(--fmpo)]">({translations?.latest_year_indicator || 'Latest'})</span>
                        )}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
