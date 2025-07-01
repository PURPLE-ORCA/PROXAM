<?php

namespace App\Exports;

use App\Models\Attribution;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AttributionsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $attributions;

    public function __construct($attributions)
    {
        $this->attributions = $attributions;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return $this->attributions;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        // Define the exact headers for your Excel file
        return [
            'Prénom',
            'Nom',
            'Examen',
            'Module',
            'Salle',
            'Rôle',
            'Date et Heure',
        ];
    }

    /**
     * @param Attribution $attribution
     * @return array
     */
    public function map($attribution): array
    {
        // Map each attribution model to a row array
        return [
            $attribution->professeur->prenom,
            $attribution->professeur->nom,
            $attribution->examen->nom,
            $attribution->examen->module->nom,
            $attribution->salle->nom ?? 'N/A', // Handle case where salle might not be set
            $attribution->is_responsable ? 'Responsable' : 'Invigilator',
            $attribution->examen->debut->format('d/m/Y H:i'),
        ];
    }
}
