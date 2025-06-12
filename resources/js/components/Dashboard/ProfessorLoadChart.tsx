import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react';

interface ProfessorLoadData {
    name: string;
    assignments: number;
}

interface ProfessorLoadChartProps {
    data: ProfessorLoadData[];
    translations: any;
}

export default function ProfessorLoadChart({ data, translations }: ProfessorLoadChartProps) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>{translations.professor_assignment_load}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{
                    assignments: {
                        label: translations.assignments,
                        color: "hsl(var(--chart-1))",
                    },
                }} className="aspect-auto h-[300px] w-full">
                        <BarChart layout="vertical" data={data} margin={{ left: 100, right: 20 }} width={330} height={300}>
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" dataKey="assignments" />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="assignments" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
