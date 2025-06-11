import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react';

interface RankDistributionData {
    rank: string;
    count: number;
    color: string;
}

interface RankDistributionChartProps {
    data: RankDistributionData[];
    translations: any;
}

export default function RankDistributionChart({ data, translations }: RankDistributionChartProps) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>{translations.professor_rank_distribution}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
                <ChartContainer config={{
                    count: {
                        label: translations.count,
                        color: "hsl(var(--chart-1))",
                    },
                }} className="aspect-auto h-[300px] w-full">
                        <PieChart width={330} height={300}>
                            <Pie
                                data={data}
                                dataKey="count"
                                nameKey="rank"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                labelLine={false}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {data.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-sm text-muted-foreground">{entry.rank} ({entry.count})</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
