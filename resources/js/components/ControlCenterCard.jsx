import { Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { useContext } from 'react';
import { TranslationContext } from '@/context/TranslationProvider';

export default function ControlCenterCard({ item }) {
    const { translations } = useContext(TranslationContext);

    // Gracefully handle translations with fallbacks from our manifest
    const title = translations?.[item.titleKey] || item.fallbackTitle;
    const description = translations?.[item.descriptionKey] || item.fallbackDescription;

    return (
        // The Link wraps the Card, making the whole thing clickable
        <Link href={route(item.route)} className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg">
            <Card className="h-full transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
                        <Icon icon={item.icon} className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-grow">
                        <CardTitle className="text-base">{title}</CardTitle>
                        <CardDescription className="mt-1 text-sm">{description}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    );
}
