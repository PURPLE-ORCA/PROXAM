import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import React from 'react';

interface RoomUtilizationData {
    room_name: string;
    usage_count: number;
}

interface RoomUtilizationChartProps {
    data: RoomUtilizationData[];
    translations: any;
}

export default function RoomUtilizationChart({ data, translations }: RoomUtilizationChartProps) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>{translations.room_utilization}</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{
                    usage_count: {
                        label: translations.usage_count,
                        color: "hsl(var(--chart-3))",
                    },
                }} className="aspect-auto h-[300px] w-full">
                        <BarChart layout="vertical" data={data} margin={{ left: 100, right: 20 }} width={330} height={300}>
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" dataKey="usage_count" />
                            <YAxis type="category" dataKey="room_name" width={120} tick={{ fontSize: 12 }} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="usage_count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
