<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendProfessorScheduleNotifications;
use App\Models\Seson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage; // Add this line
use ZipArchive; // Add this line
use Illuminate\Support\Facades\Log; // Add this line
use Inertia\Inertia; // Add this line

class SesonNotificationController extends Controller
{
    public function approveAndDispatchNotifications(Seson $seson)
    {
        // Authorization: Define this Gate or use middleware
        // Gate::authorize('approve-seson-assignments', $seson);

        if ($seson->assignments_approved_at) {
            return redirect()->back()->with('info', 'Assignments for this seson have already been approved.');
        }

        DB::transaction(function () use ($seson) {
            $seson->assignments_approved_at = now();
            $seson->approval_user_id = 1; // Placeholder: Assuming user ID 1 for approval, adjust as per authentication setup
            $seson->save();
        });

        SendProfessorScheduleNotifications::dispatch($seson);

        return redirect()->route('admin.sesons.index')->with('success', "Assignments for seson '{$seson->nom}' approved. Notifications are being processed.");
    }

    public function downloadAllConvocations(Seson $seson)
    {
        // Authorization: Ensure only authorized users can download
        // Gate::authorize('download-convocations', $seson); // You might want to add a specific gate

        $directory = "convocations/{$seson->id}";

        if (!Storage::disk('local')->exists($directory)) {
            return redirect()->back()->with('error', 'No convocations found for this seson.');
        }

        $files = Storage::disk('local')->files($directory);

        if (empty($files)) {
            return redirect()->back()->with('error', 'No convocation files found in the directory.');
        }

        $zipFileName = 'convocations_' . \Illuminate\Support\Str::slug($seson->nom) . '_' . now()->format('Ymd_His') . '.zip';
        $tempZipPath = storage_path('app/temp_zips/' . $zipFileName);

        // Ensure the temp_zips directory exists
        if (!is_dir(storage_path('app/temp_zips'))) {
            mkdir(storage_path('app/temp_zips'), 0755, true);
        }

        $zip = new ZipArchive;
        if ($zip->open($tempZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
            foreach ($files as $file) {
                $absoluteFilePath = Storage::disk('local')->path($file);
                $fileNameInZip = basename($file); // Get just the file name, not the full path
                $zip->addFile($absoluteFilePath, $fileNameInZip);
            }
            $zip->close();
            Log::info("Generated ZIP file: {$tempZipPath}");

            return response()->download($tempZipPath, $zipFileName)->deleteFileAfterSend(true);
        } else {
            Log::error("Failed to create ZIP archive at: {$tempZipPath}");
            return redirect()->back()->with('error', 'Failed to create ZIP archive.');
        }
    }
}
