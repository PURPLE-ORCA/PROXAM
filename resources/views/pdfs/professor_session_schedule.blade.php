<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faculté de Médecine et de Pharmacie - Oujda</title>
    <style>
        @page {
            margin: 20mm;
            size: A4;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding: 10px 0;
        }
        
        .left-section {
            flex: 1;
            text-align: left;
        }
        
        .center-section {
            flex: 1;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .right-section {
            flex: 1;
            text-align: right;
            direction: rtl;
        }
        
        .logo-placeholder {
            width: 80px;
            height: 80px;
            background-color: #8B4513;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 10px;
        }
        
        .university-name {
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .faculty-name {
            font-size: 11px;
            margin-bottom: 2px;
        }
        
        .city {
            font-size: 11px;
            font-weight: bold;
        }
        
        .arabic-text {
            direction: rtl;
            text-align: right;
            font-weight: bold;
            line-height: 1.6;
        }
        
        .red-line {
            height: 3px;
            background-color: #C41E3A;
            margin: 20px 0;
        }
        
        .dean-title {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin: 30px 0;
            line-height: 1.5;
        }
        
        .recipient {
            margin: 30px 0;
            text-align: center;
        }
        
        .professor-name {
            background-color: black;
            color: black;
            padding: 2px 50px;
            display: inline-block;
            margin-top: 5px;
        }
        
        .content {
            margin: 30px 0;
            text-align: left;
        }
        
        .object {
            font-weight: bold;
            margin-bottom: 20px;
        }
        
        .greeting {
            margin-bottom: 20px;
        }
        
        .main-text {
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .schedule-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        
        .schedule-table th,
        .schedule-table td {
            border: 1px solid #333;
            padding: 12px;
            text-align: center;
            font-weight: bold;
        }
        
        .schedule-table th {
            background-color: #f5f5f5;
        }
        
        .date-location {
            text-align: right;
            margin: 40px 0;
            font-weight: bold;
        }
        
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #f5f5f5;
            padding: 10px;
            font-size: 10px;
            text-align: center;
            border-top: 2px solid #C41E3A;
            line-height: 1.3;
        }
        
        .footer-content {
            color: #666;
        }
        
        .page-content {
            padding-bottom: 60px;
        }

        .highlight {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="page-content">
        <img src="file://{{ base_path('public/images/pdf/schedulepdfheader.jpg') }}" alt="Header Image" style="width: 100%; height: auto;">
        
        <div class="red-line"></div>
        
        <div class="dean-title">
            Le Doyen de la Faculté de Médecine et de Pharmacie<br>
            Université Mohammed Premier Oujda
        </div>
        
        <div class="recipient">
            A Monsieur/Madame :<br>
            A Monsieur/Madame :<br>
            <span style="font-weight: bold;">Pr. {{ $professor->nom_complet ?? 'N/A' }}</span>
        </div>
        
        <div class="content">
            <div class="object">
                <span class="highlight">Objet :</span> participation au jury des examens de <span class="highlight">la {{ $seson->nom ?? 'N/A' }} du {{ $quadrimestre->nom ?? 'N/A' }} {{ $anneeUn->nom ?? 'N/A' }}</span>.
            </div>
            
            <div class="greeting">
                Cher(ère) Collègue,
            </div>
            
            <div class="main-text">
                Vous êtes prié(e) de se présenter au lieu, à la date et à l'heure indiquée sur le tableau ci-dessous pour participer aux examens de surveillances des examens de <span class="highlight">la {{ $seson->nom ?? 'N/A' }} du {{ $quadrimestre->nom ?? 'N/A' }} {{ $anneeUn->nom ?? 'N/A' }}</span>.<br>
                Veuillez, cher(ère) collègue, recevoir nos meilleures salutations.
            </div>
        </div>
        
        <table class="schedule-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Lieu</th>
                    <th>Matière</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($assignments as $attribution)
                    <tr>
                        <td>{{ $attribution->examen?->debut?->format('d/m/Y') ?? 'N/A' }}</td>
                        <td>{{ $attribution->examen?->debut?->format('H:i') ?? 'N/A' }}</td>
                        <td>{{ $attribution->salle?->nom ?? 'N/A' }}</td>
                        <td>{{ $attribution->examen?->module?->nom ?? 'N/A' }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" style="text-align: center;">Aucune affectation pour cette session.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
        
        <div class="date-location">
            Oujda le {{ $generationDate?->format('d/m/Y') ?? '' }}
        </div>
    </div>
    
    <div class="footer">
        <div class="footer-content">
            Faculté de Médecine et de Pharmacie d'Oujda, Hay al Hikma, BP, 4867, Oujda, 60049, Maroc. Tel : 0536531414 ; Fax : 0536531919, Site Web : <span style="color: blue;">http://fmpo.ump.ma</span>; E-mail : fmpoujda@ump.ac.ma
        </div>
    </div>
</body>
</html>
