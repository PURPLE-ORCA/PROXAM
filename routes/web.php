<?php

use App\Http\Controllers\AnneeUniController;
use App\Http\Controllers\ExamenController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\ProfesseurController;
use App\Http\Controllers\QuadrimestresController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SesonController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// use Illuminate\Support\Facades\Mail;
// use Illuminate\Mail\Mailable;

// Route::get('/test-email', function () {
//     if (!auth()->check() || !auth()->user()->hasRole('admin')) { // Quick auth check
//         return 'Unauthorized';
//     }
//     try {
//         Mail::raw('This is a test email from Profs2Exams.', function ($message) {
//             $message->to('test@example.com') // This email won't actually be sent if using Mailtrap
//                     ->subject('Test Email');
//         });
//         return 'Test email sent (check Mailtrap)!';
//     } catch (\Exception $e) {
//         return 'Error sending email: ' . $e->getMessage();
//     }
// });

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::prefix('admin')->name('admin.')->middleware('can:is_admin')->group(function () {
        Route::resource('services', ServiceController::class)->except(['show']);
        Route::resource('modules', ModuleController::class)->except(['show']);
        Route::resource('salles', SalleController::class)->except(['show']); 
        Route::resource('annees-universitaires', AnneeUniController::class)->parameters(['annees-universitaires' => 'anneeUni']) ->except(['show']);
        Route::resource('sesons', SesonController::class) ->parameters(['sesons' => 'seson']) ->except(['show']);
        Route::resource('quadrimestres', QuadrimestresController::class)->parameters(['quadrimestres' => 'quadrimestre']) ->except(['show']);
        Route::resource('users', UserController::class)->parameters(['users' => 'user'])->except(['show']);
        Route::resource('professeurs', ProfesseurController::class)->parameters(['professeurs' => 'professeur'])->except(['show']);
        Route::resource('examens', ExamenController::class)->parameters(['examens' => 'examen'])->except(['show']);
    });
    
}); 

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';