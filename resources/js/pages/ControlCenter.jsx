import { Head, usePage } from '@inertiajs/react';
import { controlCenterItems } from '@/lib/navigation';
import { useContext, useMemo } from 'react';
import Masonry from 'react-masonry-css';
import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import ControlCenterCard from '@/components/ControlCenterCard';

export default function ControlCenter() {
    const { auth } = usePage().props;
    const { translations } = useContext(TranslationContext);

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
        <AppLayout>
            <Head title="Control Center" />
            <div className="container mx-auto p-4 md:p-6 lg:p-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                    {translations?.control_center_title || 'Control Center'}
                </h1>
                <p className="text-muted-foreground mb-8">
                    {translations?.control_center_subtitle || 'Select a module to manage your application.'}
                </p>

                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {accessibleItems.map(item => (
                        <ControlCenterCard key={item.route} item={item} />
                    ))}
                </Masonry>
            </div>
        </AppLayout>
    );
}
