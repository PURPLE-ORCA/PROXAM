<x-mail::message>
# Exchange Proposal Withdrawn

Dear {{ $echange->requester->user->name }},

The exchange proposal for your exam duty: **{{ $echange->offeredAttribution->examen->name }}** ({{ $echange->offeredAttribution->examen->debut->format('d/m/Y H:i') }}) from **{{ $echange->accepter->user->name }}** has been withdrawn.

Your original exchange request is now open again for new proposals.

<x-mail::button :url="route('professeur.exchanges.index', ['tab' => 'my-open-requests'])">
View My Open Requests
</x-mail::button>

Thank you for using our system.

Regards,
{{ config('app.name') }}
</x-mail::message>
