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
        <Link
            href={route(item.route)}
            className="focus-visible:ring-offset-background block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--fmpo)] focus-visible:ring-offset-2"
        >
            <Card className="h-full transition-all duration-100 hover:-translate-y-1 hover:border-[var(--fmpo)] hover:shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <div className="flex-shrink-0 p-3">
                        <Icon icon={item.icon} className="h-8 w-8 text-[var(--fmpo)]" />
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
