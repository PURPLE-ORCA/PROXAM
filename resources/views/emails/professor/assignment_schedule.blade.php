@component('mail::message')
# Convocation aux Surveillances des Examens - Session {{ $sesonName }}

Cher(ère) Collègue {{ $professorName }},

Veuillez trouver ci-joint votre emploi du temps détaillé pour les surveillances des examens de la session **{{ $sesonName }}**.

Nous vous remercions de votre participation.

Cordialement,
L'administration de la Faculté de Médecine et de Pharmacie d'Oujda.

{{-- Optional:
@component('mail::button', ['url' => $scheduleUrl ?? '#'])
Voir mon emploi du temps en ligne
@endcomponent
--}}
@endcomponent
