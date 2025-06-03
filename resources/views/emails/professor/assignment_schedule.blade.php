@component('mail::message')
# Convocation aux Surveillances des Examens - Session {{ $sesonName }}
## {{ $quadrimestreName ?? '' }} - {{ $anneeUniName ?? '' }}

Cher(ère) Collègue {{ $professorName }},

Vous êtes prié(e) de vous présenter au lieu, à la date et à l'heure indiqués ci-dessous pour participer aux surveillances des examens de la session **{{ $sesonName }}**.

@if ($assignments->isNotEmpty())
Voici le détail de vos surveillances :

@component('mail::table')
| Date | Heure | Lieu | Matière |
| :--------- | :-------- | :----------- | :-------------------------- |
@foreach ($assignments as $attribution)
| {{ $attribution->examen->debut ? $attribution->examen->debut->format('d/m/Y') : 'N/A' }} | {{ $attribution->examen->debut ? $attribution->examen->debut->format('H:i') : 'N/A' }} | {{ $attribution->salle->nom ?? 'N/A' }} | {{ $attribution->examen->module->nom ?? 'N/A' }} |
@endforeach
@endcomponent
@else
Aucune surveillance ne vous a été assignée pour cette session pour le moment.
@endif

Nous vous remercions de votre participation.

Cordialement,
L'administration de la Faculté de Médecine et de Pharmacie d'Oujda.
@endcomponent
