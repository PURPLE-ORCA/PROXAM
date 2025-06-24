import { Head, usePage } from '@inertiajs/react';
import { controlCenterItems } from '@/lib/navigation';
import { useContext, useMemo } from 'react';
import Masonry from 'react-masonry-css';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import ControlCenterCard from '@/components/ControlCenterCard';

// --- Import your new components ---
import YearSwitcher from '@/components/Layout/Controls/YearSwitcher';
import ThemeToggle from '@/components/Layout/Controls/ThemeToggle';
import UserCard from '@/components/Layout/Controls/UserCard';

export default function ControlCenter() {
    const { auth, academicYear, translations } = usePage().props; // Get all needed props

    // This is the magic: it filters the master list of controls
    // based on the current user's roles. Memoized for performance.
    const accessibleItems = useMemo(() => {
        if (!auth.abilities) return [];

        return controlCenterItems.filter(item =>
            // Does the user have AT LEAST ONE of the required roles for this item?
            item.roles.some(role => auth.abilities[`is_${role}`])
        );
    }, [auth.abilities]);

    // Responsive breakpoints for our Masonry grid
    const breakpointColumnsObj = {
      default: 4,
      1280: 3, // For xl screens
      1024: 2, // For lg screens
      768: 1   // For md screens and below
    };

    return (
        <>
            <Head title="Control Center" />
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                <h1 className="text-foreground text-3xl font-bold tracking-tight">{translations?.control_center_title || 'Control Center'}</h1>
                {/* <p className="text-muted-foreground mb-8">{translations?.control_center_subtitle || 'Select a module to manage your application.'}</p> */}

                <div className="bg-card mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <YearSwitcher academicYear={academicYear} translations={translations} />
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <ThemeToggle />
                        <UserCard user={auth.user} translations={translations} />
                    </div>
                </div>

                <Masonry breakpointCols={breakpointColumnsObj} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
                    {accessibleItems.map((item) => (
                        <ControlCenterCard key={item.route} item={item} />
                    ))}
                </Masonry>
            </div>
        </>
    );
}
