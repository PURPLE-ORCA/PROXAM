import React, { useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { TranslationContext } from '@/context/TranslationProvider';

export default function PendingExchangeWidget({ requests, count }) {
    const { translations } = useContext(TranslationContext);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{translations?.widgetPendingExchangeReviewsTitle || 'Pending Exchange Reviews'}</CardTitle>
            </CardHeader>
            <CardContent>
                {count > 0 ? (
                    <>
                        <p className="mb-4">
                            {translations?.infoExchangeProposalsToReview?.replace('{count}', count) || `You have ${count} exchange proposals to review.`}
                        </p>
                        <ul className="space-y-2">
                            {requests.slice(0, 2).map((echange) => (
                                <li key={echange.id} className="flex flex-col space-y-1">
                                    <span>
                                        {translations?.infoProposalFrom || 'Proposal from'}{' '}
                                        <span className="font-semibold">{echange.accepter.user.name}</span>{' '}
                                        {translations?.infoForYour || 'for your'}{' '}
                                        <span className="font-semibold">{echange.offered_attribution.examen.module.nom}</span>{' '}
                                        {translations?.infoExam || 'exam.'}
                                    </span>
                                    <Link href={route('professeur.exchanges.index', { tab: 'my-open-requests', highlight: echange.id })} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                                        {translations?.linkReviewProposal || 'Review Proposal'}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>{translations?.infoNoExchangeProposalsToReview || 'No exchange proposals awaiting your review.'}</p>
                )}
            </CardContent>
        </Card>
    );
}
