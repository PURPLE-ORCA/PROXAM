import React, { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { TranslationContext } from '@/context/TranslationProvider';

export default function MyRequestsTab({ myOpenRequests, onCancelRequestClick, onReviewProposalClick }) {
    const { translations } = useContext(TranslationContext);

    return (
        <>
            <h3 className="text-lg font-semibold mb-4">{translations?.my_open_exchange_requests_heading || 'My Open Exchange Requests'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myOpenRequests.length > 0 ? (
                    myOpenRequests.map((echange) => (
                        <Card key={echange.id}>
                            <CardHeader>
                                <CardTitle>{echange.offered_attribution.examen.name}</CardTitle>
                                <CardDescription>{translations?.status_label || 'Status:'} <Badge>{echange.status.replace(/_/g, ' ')}</Badge></CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>{translations?.date_label || 'Date:'} {format(new Date(echange.offered_attribution.examen.debut), 'dd/MM/yyyy HH:mm')}</p>
                                {echange.motif && <p>{translations?.motif_label || 'Motif:'} {echange.motif}</p>}
                                {echange.status === 'Pending_Requester_Decision' && echange.accepter && (
                                    <p className="mt-2">
                                        {translations?.proposal_from_label || 'Proposal from:'} {echange.accepter.user.name} {translations?.for_label || 'for'} {echange.accepted_attribution.examen.name}
                                    </p>
                                )}
                                <div className="mt-4 flex space-x-2">
                                    {echange.status === 'Open' && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => onCancelRequestClick(echange)}
                                        >
                                            {translations?.cancel_request_button || 'Cancel Request'}
                                        </Button>
                                    )}
                                    {echange.status === 'Pending_Requester_Decision' && (
                                        <Button onClick={() => onReviewProposalClick(echange)}>
                                            {translations?.review_proposal_button || 'Review Proposal'}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p>{translations?.no_open_exchange_requests || 'You have no open exchange requests.'}</p>
                )}
            </div>
        </>
    );
}
