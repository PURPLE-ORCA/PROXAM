import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, usePage } from '@inertiajs/react';
import { Professeur, DashboardProps } from '@/types'; // Import DashboardProps
import React from 'react';

interface UnconfiguredProfessors {
    without_service: (Professeur & { user: { name: string } })[];
    without_modules: (Professeur & { user: { name: string } })[];
}

interface UnconfiguredProfessorsWidgetProps {
    translations: any;
}

export default function UnconfiguredProfessorsWidget({ translations }: UnconfiguredProfessorsWidgetProps) {
    const { unconfiguredProfessors } = usePage<DashboardProps>().props;

    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>{translations.unconfigured_professors}</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="without_service">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="without_service">
                            {translations.without_service} ({unconfiguredProfessors.without_service.length})
                        </TabsTrigger>
                        <TabsTrigger value="without_modules">
                            {translations.without_modules} ({unconfiguredProfessors.without_modules.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="without_service" className="mt-4">
                        <ScrollArea className="h-[200px]">
                            <ul className="space-y-2 pr-4">
                                {unconfiguredProfessors.without_service.length > 0 ? (
                                    unconfiguredProfessors.without_service.map((prof: Professeur) => (
                                        <li key={prof.id}>
                                            <Link href={route('admin.professeurs.edit', prof.id)} className="text-primary hover:underline">
                                                {prof.user.name}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">{translations.all_professors_have_service}</p>
                                )}
                            </ul>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="without_modules" className="mt-4">
                        <ScrollArea className="h-[200px]">
                            <ul className="space-y-2 pr-4">
                                {unconfiguredProfessors.without_modules.length > 0 ? (
                                    unconfiguredProfessors.without_modules.map((prof: Professeur) => (
                                        <li key={prof.id}>
                                            <Link href={route('admin.professeurs.edit', prof.id)} className="text-primary hover:underline">
                                                {prof.user.name}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">{translations.all_professors_have_modules}</p>
                                )}
                            </ul>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
