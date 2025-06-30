import React, { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { TranslationContext } from '@/context/TranslationProvider';

export default function HistoryTab({ exchangeHistory }) {
    const { translations } = useContext(TranslationContext);

    return (
        <>
            <h3 className="text-lg font-semibold mb-4">{translations?.exchange_history_heading || 'Exchange History'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exchangeHistory.length > 0 ? (
                    exchangeHistory.map((echange) => (
                        <Card key={echange.id}>
                            <CardHeader>
                                <CardTitle>
                                    {echange.status === 'Approved' ? (translations?.swap_completed_title || 'Swap Completed') : (translations?.exchange_terminated_title || 'Exchange Terminated')}
                                </CardTitle>
                                <CardDescription>{translations?.status_label || 'Status:'} <Badge>{echange.status.replace(/_/g, ' ')}</Badge></CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>{translations?.original_request_label || 'Original Request:'} {echange.offered_attribution.examen.name} {translations?.by_label || 'by'} {echange.requester.user.name}</p>
                                {echange.accepted_attribution && echange.accepter && (
                                    <p>{translations?.proposed_swap_label || 'Proposed Swap:'} {echange.accepted_attribution.examen.name} {translations?.by_label || 'by'} {echange.accepter.user.name}</p>
                                )}
                                <p>{translations?.date_label || 'Date:'} {format(new Date(echange.created_at), 'dd/MM/yyyy HH:mm')}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p>{translations?.no_exchange_history_available || 'No exchange history available.'}</p>
                )}
            </div>
        </>
    );
}
