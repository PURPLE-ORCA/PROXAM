import React, { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { TranslationContext } from '@/context/TranslationProvider';

export default function ExchangeMarketTab({ exchangeMarket, onProposeSwapClick }) {
    const { translations } = useContext(TranslationContext);

    return (
        <>
            <h3 className="text-lg font-semibold mb-4">{translations?.available_exchange_offers_heading || 'Available Exchange Offers'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exchangeMarket.length > 0 ? (
                    exchangeMarket.map((echange) => (
                        <Card key={echange.id}>
                            <CardHeader>
                                <CardTitle>{echange.offered_attribution.examen.name}</CardTitle>
                                <CardDescription>
                                    {translations?.offered_by_label || 'Offered by:'} {echange.requester.user.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>{translations?.date_label || 'Date:'} {format(new Date(echange.offered_attribution.examen.debut), 'dd/MM/yyyy HH:mm')}</p>
                                {echange.motif && <p>{translations?.motif_label || 'Motif:'} {echange.motif}</p>}
                                <Button
                                    className="mt-4"
                                    onClick={() => onProposeSwapClick(echange)}
                                >
                                    {translations?.propose_swap_button || 'Propose Swap'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p>{translations?.no_open_exchange_offers_available || 'No open exchange offers available.'}</p>
                )}
            </div>
        </>
    );
}
