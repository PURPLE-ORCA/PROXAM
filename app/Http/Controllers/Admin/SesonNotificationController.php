<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendProfessorScheduleNotifications;
use App\Models\Seson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;

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
}
