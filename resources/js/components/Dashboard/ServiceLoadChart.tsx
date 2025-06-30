import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react';

interface ServiceLoadData {
    service_name: string;
    total_hours: number;
}

interface ServiceLoadChartProps {
    data: ServiceLoadData[];
    translations: any;
}

export default function ServiceLoadChart({ data, translations }: ServiceLoadChartProps) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>{translations.service_department_load}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{
                    total_hours: {
                        label: translations.total_hours,
                        color: "hsl(var(--chart-2))",
                    },
                }} className="aspect-auto h-[300px] w-full">
                        <BarChart layout="vertical" data={data} margin={{ left: 100, right: 20 }} width={330} height={300}>
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" dataKey="total_hours" />
                            <YAxis type="category" dataKey="service_name" width={120} tick={{ fontSize: 12 }} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="total_hours" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
