<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function getPendingCount()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['count' => 0]);
        }
        $count = $user->customNotifications()->whereNull('read_at')->count();
        return response()->json(['count' => $count]);
    }

    public function getLatest()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['notifications' => []]);
        }
        $notifications = $user->customNotifications()
                            ->orderBy('created_at', 'desc')
                            ->limit(5)
                            ->get();
        return response()->json(['notifications' => $notifications]);
    }

    public function markAsRead(Request $request, ?Notification $notification = null) // Typehint your model
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($notification) {
            // Mark a specific notification as read
            if ($notification->user_id === $user->id) {
                $notification->update(['read_at' => now()]);
                return response()->json(['message' => 'Notification marked as read.']);
            }
            return response()->json(['message' => 'Unauthorized to mark this notification as read.'], 403);
        } else {
            // Mark all unread notifications as read
            $user->customNotifications()->whereNull('read_at')->update(['read_at' => now()]);
            return response()->json(['message' => 'All notifications marked as read.']);
        }
    }
}
