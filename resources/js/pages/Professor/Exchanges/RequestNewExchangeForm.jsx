import React, { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { TranslationContext } from '@/context/TranslationProvider';

export default function RequestNewExchangeForm({
    myAttributions,
    data,
    setData,
    onSubmit,
    processing,
    errors
}) {
    const { translations } = useContext(TranslationContext);

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>{translations?.request_new_exchange_card_title || 'Request a New Exchange'}</CardTitle>
                <CardDescription>{translations?.request_new_exchange_card_description || 'Offer one of your assignments for exchange.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="newRequestAttributionId">{translations?.your_assignment_to_offer_label || 'Your Assignment to Offer'}</Label>
                        <Select
                            onValueChange={(value) => setData('attribution_id', value)}
                            value={data.attribution_id}
                            disabled={processing}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={translations?.select_an_assignment_placeholder || 'Select an assignment'} />
                            </SelectTrigger>
                            <SelectContent>
                                {myAttributions.map((attr) => (
                                    <SelectItem key={attr.id} value={attr.id}>
                                        {attr.examen.name} ({format(new Date(attr.examen.debut), 'dd/MM/yyyy HH:mm')})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.attribution_id && <p className="text-red-500 text-sm mt-1">{errors.attribution_id}</p>}
                    </div>
                    <div>
                        <Label htmlFor="newRequestMotif">{translations?.motif_optional_label || 'Motif (Optional)'}</Label>
                        <Textarea
                            id="newRequestMotif"
                            value={data.motif}
                            onChange={(e) => setData('motif', e.target.value)}
                            placeholder={translations?.reason_for_exchange_placeholder || 'Reason for exchange (e.g., scheduling conflict)'}
                            disabled={processing}
                        />
                        {errors.motif && <p className="text-red-500 text-sm mt-1">{errors.motif}</p>}
                    </div>
                    <Button type="submit" disabled={processing}>
                        {processing ? (translations?.submitting_button || 'Submitting...') : (translations?.submit_exchange_request_button || 'Submit Exchange Request')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
