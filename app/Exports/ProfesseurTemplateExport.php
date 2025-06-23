<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
// --- 1. ADD THE NECESSARY IMPORTS ---
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
// ------------------------------------

// --- 2. IMPLEMENT THE WithEvents CONCERN ---
class ProfesseurTemplateExport implements FromCollection, WithHeadings, WithEvents
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return collect([]);
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'prenom',
            'nom',
            'email',
            'service',
            'grade',
            'specialite',
            'recrutement',
            'chef_de_service',
        ];
    }

    /**
     * @return array
     */
    // --- 3. ADD THE registerEvents METHOD ---
    public function registerEvents(): array
    {
        return [
            // This event fires right after the sheet is created.
            AfterSheet::class => function(AfterSheet $event) {
                // We get the underlying PhpSpreadsheet object and tell it
                // to remove any password protection, effectively unlocking it.
                $event->sheet->getDelegate()->getProtection()->setPassword('');
            },
        ];
    }
    // ----------------------------------------
}