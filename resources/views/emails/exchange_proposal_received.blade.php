<x-mail::message>
# New Exchange Proposal

Dear {{ $echange->requester->user->name }},

You have received a new exchange proposal for your exam duty: **{{ $echange->offeredAttribution->examen->name }}** ({{ $echange->offeredAttribution->examen->debut->format('d/m/Y H:i') }}).

The proposal is from **{{ $echange->accepter->user->name }}** who is offering their exam duty: **{{ $echange->acceptedAttribution->examen->name }}** ({{ $echange->acceptedAttribution->examen->debut->format('d/m/Y H:i') }}).

Please review the proposal and decide whether to accept or refuse it.

<x-mail::button :url="route('professeur.exchanges.index', ['tab' => 'my-open-requests'])">
View Proposal
</x-mail::button>

Thank you for using our system.

Regards,
{{ config('app.name') }}
</x-mail::message>
