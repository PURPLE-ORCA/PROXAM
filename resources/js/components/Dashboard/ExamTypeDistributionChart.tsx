import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react';

interface ExamTypeDistributionChartProps {
    data: { [key: string]: number };
    translations: any;
}

export default function ExamTypeDistributionChart({ data, translations }: ExamTypeDistributionChartProps) {
    const examTypeData = Object.entries(data).map(([name, value], index) => ({
        name,
        value,
        fill: ['#2f024f', '#4B5563', '#9CA3AF', '#D1D5DB'][index % 4], // Using theme colors
    }));

    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>{translations.exam_type_distribution}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
                <ChartContainer config={{
                    value: {
                        label: translations.count,
                        color: "hsl(var(--chart-1))",
                    },
                }} className="aspect-auto h-[300px] w-full">
                    <PieChart width={330} height={300}>
                        <Pie
                            data={examTypeData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            labelLine={false}
                        >
                            {examTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {examTypeData.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: entry.fill }} />
                            <span className="text-sm text-muted-foreground">{entry.name} ({entry.value})</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
