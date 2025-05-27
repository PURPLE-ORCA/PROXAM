<x-mail::message>
# Exam Exchange Automatically Cancelled

Dear {{ $echange->requester->user->name }},

Your exchange request for the exam duty: **{{ $echange->offeredAttribution->examen->name }}** ({{ $echange->offeredAttribution->examen->debut->format('d/m/Y H:i') }}) has been automatically cancelled.

This is because the exam is scheduled to start in less than 24 hours, or the exchange was no longer valid.

@if($echange->professeur_accepter_id)
The proposal from **{{ $echange->accepter->user->name }}** for their exam duty: **{{ $echange->acceptedAttribution->examen->name }}** has also been cancelled.
@endif

<x-mail::button :url="route('professeur.exchanges.index', ['tab' => 'exchange-history'])">
View Exchange History
</x-mail::button>

Thank you for using our system.

Regards,
{{ config('app.name') }}
</x-mail::message>
