import React, { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { TranslationContext } from '@/context/TranslationProvider';

export default function MyProposalsTab({ myProposals, onWithdrawProposalClick }) {
    const { translations } = useContext(TranslationContext);

    return (
        <>
            <h3 className="text-lg font-semibold mb-4">{translations?.my_exchange_proposals_heading || 'My Exchange Proposals'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProposals.length > 0 ? (
                    myProposals.map((echange) => (
                        <Card key={echange.id}>
                            <CardHeader>
                                <CardTitle>{translations?.proposed_for_label || 'Proposed for:'} {echange.offered_attribution.examen.name}</CardTitle>
                                <CardDescription>{translations?.status_label || 'Status:'} <Badge>{echange.status.replace(/_/g, ' ')}</Badge></CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>{translations?.requester_label || 'Requester:'} {echange.requester.user.name}</p>
                                <p>{translations?.your_offered_exam_label || 'Your Offered Exam:'} {echange.accepted_attribution.examen.name} ({format(new Date(echange.accepted_attribution.examen.debut), 'dd/MM/yyyy HH:mm')})</p>
                                {echange.status === 'Pending_Requester_Decision' && (
                                    <Button
                                        variant="destructive"
                                        className="mt-4"
                                        onClick={() => onWithdrawProposalClick(echange)}
                                    >
                                        {translations?.withdraw_proposal_button || 'Withdraw Proposal'}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p>{translations?.no_active_exchange_proposals || 'You have no active exchange proposals.'}</p>
                )}
            </div>
        </>
    );
}
