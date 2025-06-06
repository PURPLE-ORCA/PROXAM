import React, { useContext } from 'react';
import AppLayout from '../../layouts/app-layout';
import { Head } from '@inertiajs/react';
import { TranslationContext } from '../../context/TranslationProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { format, parseISO } from 'date-fns';

export default function ProfessorSchedulesIndex({ professeursInService, attributionsByProfessor, serviceName, auth, academicYear }) {
    const { translations } = useContext(TranslationContext);

    const formatTimeFromISO = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);   
            // Using toLocaleTimeString is a robust way to format time
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch (e) {
            return 'Invalid Time';
        }
    };

    return (
        <AppLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {translations?.chef_service_professor_schedules_page_title?.replace('{serviceName}', serviceName) || `Professor Schedules - Service ${serviceName}`} ({academicYear?.selected_annee || ''})
            </h2>}
        >
            <Head title={translations?.chef_service_professor_schedules_page_title?.replace('{serviceName}', serviceName) || `Professor Schedules - Service ${serviceName}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-black overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {professeursInService.map(professor => (
                            <Card key={professor.id} className="mb-6">
                                <CardHeader>
                                    <CardTitle>{professor.nom} {professor.prenom}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {attributionsByProfessor[professor.id] && attributionsByProfessor[professor.id].length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{translations?.date || 'Date'}</TableHead>
                                                    <TableHead>{translations?.time || 'Time'}</TableHead>
                                                    <TableHead>{translations?.duration || 'Duration'}</TableHead>
                                                    <TableHead>{translations?.module || 'Module'}</TableHead>
                                                    <TableHead>{translations?.room || 'Room'}</TableHead>
                                                    <TableHead>{translations?.role || 'Role'}</TableHead>
                                                    <TableHead>{translations?.session || 'Session'}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {attributionsByProfessor[professor.id].map(attribution => (
                                                    <TableRow key={attribution.id}>
                                                        {/* Date */}
                                                        <TableCell>{format(parseISO(attribution.examen.debut), 'dd/MM/yyyy')}</TableCell>

                                                        {/* Time - CORRECTED */}
                                                        <TableCell>{formatTimeFromISO(attribution.examen.debut)} - {formatTimeFromISO(attribution.examen.end_datetime)}</TableCell>
                                                        
                                                        {/* Duration - CORRECTED */}
                                                        <TableCell>2 {translations?.hours || 'hours'}</TableCell>

                                                        {/* Module */}
                                                        <TableCell>{attribution.examen.module.nom}</TableCell>
                                                        
                                                        {/* Room */}
                                                        <TableCell>{attribution.salle.nom}</TableCell>

                                                        {/* Role */}
                                                        <TableCell>{attribution.is_responsable ? (translations?.roleResponsable || 'Responsable') : (translations?.roleInvigilator || 'Invigilator')}</TableCell>
                                                        
                                                        {/* Session - CORRECTED */}
                                                        <TableCell>{attribution.examen.seson.code}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <p>{translations?.no_schedules_found || 'No schedules found for this professor.'}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
