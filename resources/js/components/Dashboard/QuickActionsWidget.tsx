import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import React from 'react';

interface QuickActionsWidgetProps {
    translations: any;
}

export default function QuickActionsWidget({ translations }: QuickActionsWidgetProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{translations.quick_actions}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Link href={route('admin.examens.create')}>
                    <Button className="w-full bg-[var(--fmpo)] text-xl">{translations.create_new_exam}</Button>
                </Link>
                <Link href={route('admin.professeurs.create')}>
                    <Button className="w-full bg-[var(--fmpo)] text-xl">{translations.add_new_professor}</Button>
                </Link>
                <Link href={route('admin.unavailabilities.create')}>
                    <Button className="w-full bg-[var(--fmpo)] text-xl">{translations.add_unavailability}</Button>
                </Link>
                <Link href={route('professeur.exchanges.index')}>
                    <Button className="w-full bg-[var(--fmpo)] text-xl">{translations.view_exchange_requests}</Button>
                </Link>
            </CardContent>
        </Card>
    );
}
