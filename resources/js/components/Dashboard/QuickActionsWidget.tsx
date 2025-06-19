import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import React, { useContext } from 'react';
import { TranslationContext } from '@/context/TranslationProvider';

interface QuickActionsWidgetProps {
    translations: any;
}

export default function QuickActionsWidget({ translations: propTranslations }: QuickActionsWidgetProps) {
    const { translations } = useContext(TranslationContext);

    const quickActions = [
        {
            route: 'admin.examens.create',
            icon: 'mdi:file-document-plus-outline',
            titleKey: 'create_new_exam',
            fallbackTitle: propTranslations.create_new_exam,
            descriptionKey: 'create_new_exam_description',
            fallbackDescription: 'Create a new examination record.',
        },
        {
            route: 'admin.professeurs.index',
            icon: 'mdi:account-plus-outline',
            titleKey: 'add_new_professor',
            fallbackTitle: propTranslations.add_new_professor,
            descriptionKey: 'add_new_professor_description',
            fallbackDescription: 'Add a new professor to the system.',
        },
        {
            route: 'admin.unavailabilities.create',
            icon: 'mdi:calendar-remove-outline',
            titleKey: 'add_unavailability',
            fallbackTitle: propTranslations.add_unavailability,
            descriptionKey: 'add_unavailability_description',
            fallbackDescription: 'Mark a professor\'s unavailability.',
        },
        {
            route: 'professeur.exchanges.index',
            icon: 'mdi:swap-horizontal',
            titleKey: 'view_exchange_requests',
            fallbackTitle: propTranslations.view_exchange_requests,
            descriptionKey: 'view_exchange_requests_description',
            fallbackDescription: 'View and manage exam exchange requests.',
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{propTranslations.quick_actions}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {quickActions.map((item, index) => (
                    <Link key={index} href={route(item.route)} className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg">
                        <Card className="h-full transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-1">
                            <CardHeader className="flex flex-row items-center gap-4 p-4">
                                <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
                                    <Icon icon={item.icon} className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-grow">
                                    <CardTitle className="text-base">{translations?.[item.titleKey] || item.fallbackTitle}</CardTitle>
                                    <CardDescription className="mt-1 text-sm">{translations?.[item.descriptionKey] || item.fallbackDescription}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}
