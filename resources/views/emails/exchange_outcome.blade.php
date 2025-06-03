<x-mail::message>
# Exchange Proposal {{ ucfirst($outcomeStatus) }}

Dear {{ $echange->accepter->user->name }},

Your exchange proposal for the exam duty: **{{ $echange->offeredAttribution->examen->name }}** ({{ $echange->offeredAttribution->examen->debut->format('d/m/Y H:i') }}) has been **{{ $outcomeStatus }}** by {{ $echange->requester->user->name }}.

@if($outcomeStatus === 'approved')
The swap has been successfully completed. Your new assignment is **{{ $echange->offeredAttribution->examen->name }}** and {{ $echange->requester->user->name }}'s new assignment is **{{ $echange->acceptedAttribution->examen->name }}**.
@else
The proposal was refused. Your proposed assignment **{{ $echange->acceptedAttribution->examen->name }}** is now available for other exchanges.
@endif

<x-mail::button :url="route('professeur.exchanges.index', ['tab' => 'exchange-history'])">
View Exchange History
</x-mail::button>

Thank you for using our system.

Regards,
{{ config('app.name') }}
</x-mail::message>
