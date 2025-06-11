<?php

use App\Http\Controllers\Admin\ExamAssignmentManagementController;
use App\Http\Controllers\LevelController;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\AnneeUniController;
use App\Http\Controllers\AttributionController;
use App\Http\Controllers\ExamenController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\ModuleExamRoomConfigController;
use App\Http\Controllers\ProfesseurController;
use App\Http\Controllers\QuadrimestresController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SesonController;
use App\Http\Controllers\UnavailabilityController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Professor\ScheduleController as ProfessorScheduleController;
use App\Http\Controllers\Professor\DashboardController as ProfessorDashboardController; // Add this
use App\Http\Controllers\Professor\UnavailabilityController as ProfessorUnavailabilityController; // Add this
use App\Http\Controllers\Professor\ExchangeController as ProfessorExchangeController;
use App\Http\Controllers\RH\DashboardController as RHDashboardController; // New controller
use App\Http\Controllers\ChefService\ProfessorScheduleController as ChefServiceProfessorScheduleController; // New controller
use App\Http\Controllers\Admin\ProfesseurImportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use Illuminate\Http\Request;
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
Route::get('dashboard', function (Request $request) {
    $user = $request->user();
    if ($user->hasRole('professeur')) {
        return redirect()->route('professeur.dashboard');
    }
    if ($user->hasRole('rh')) {
        return redirect()->route('rh.dashboard');
    }
    // If the user is an admin or any other role not explicitly redirected, render the admin dashboard
    return app(AdminDashboardController::class)->index($request);
})->name('dashboard');

    Route::prefix('admin')->name('admin.')->middleware('can:is_admin')->group(function () {
        // The admin dashboard is now directly rendered by the main /dashboard route, so this specific route is no longer needed.
        // Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::resource('services', ServiceController::class)->except(['show']);
        // Route::resource('modules', ModuleController::class)->except(['show']);
        Route::resource('salles', SalleController::class)->except(['show']); 
        Route::resource('annees-universitaires', AnneeUniController::class)->parameters(['annees-universitaires' => 'anneeUni']) ->except(['show']);
        Route::resource('sesons', SesonController::class) ->parameters(['sesons' => 'seson']) ->except(['show']);
        Route::resource('quadrimestres', QuadrimestresController::class)->parameters(['quadrimestres' => 'quadrimestre']) ->except(['show']);
        Route::resource('users', UserController::class)->parameters(['users' => 'user'])->except(['show']);
        Route::resource('professeurs', ProfesseurController::class)->parameters(['professeurs' => 'professeur'])->except(['show']);
        Route::post('/professeurs/import', [ProfesseurImportController::class, 'store'])->name('professeurs.import');
        Route::resource('examens', ExamenController::class)->parameters(['examens' => 'examen'])->except(['show']);
        // Route::resource('unavailabilities', UnavailabilityController::class)->parameters(['unavailabilities' => 'unavailability'])->except(['show']);   
        
        Route::post('/examens/{examen}/assign-professors', [ExamenController::class, 'triggerAssignment'])->name('examens.trigger-assignment');
        Route::get('attributions', [AttributionController::class, 'index'])->name('attributions.index');   
        Route::get('/examens/{examen}/manage-assignments', [ExamAssignmentManagementController::class, 'index'])->name('examens.assignments.index');
        Route::post('/examens/{examen}/manage-assignments', [ExamAssignmentManagementController::class, 'storeAttribution'])->name('examens.assignments.store');
        Route::put('/manage-assignments/{attribution}/toggle-responsable', [ExamAssignmentManagementController::class, 'toggleResponsable'])->name('attributions.toggle-responsable');
        Route::delete('/manage-assignments/{attribution}', [ExamAssignmentManagementController::class, 'destroyAttribution'])->name('attributions.destroy_manual');
        Route::resource('filieres', FiliereController::class)->parameters(['filieres' => 'filiere'])->except(['show']);
    
        Route::get('/filieres/{filiere}/levels', [LevelController::class, 'index'])->name('levels.index');
        Route::get('/levels/create', [LevelController::class, 'create'])->name('levels.create'); // Can take ?filiere_id=X
        Route::post('/levels', [LevelController::class, 'store'])->name('levels.store');
        Route::get('/levels/{level}/edit', [LevelController::class, 'edit'])->name('levels.edit');
        Route::put('/levels/{level}', [LevelController::class, 'update'])->name('levels.update');
        Route::delete('/levels/{level}', [LevelController::class, 'destroy'])->name('levels.destroy');
    
        Route::get('/levels/{level}/modules', [ModuleController::class, 'indexForLevel'])->name('modules.index'); // New method

        Route::get('/levels/{level}/modules/create', [ModuleController::class, 'create'])->name('modules.create'); // Pass level_id

        Route::post('/modules', [ModuleController::class, 'store'])->name('modules.store'); 
        Route::get('/modules/{module}/edit', [ModuleController::class, 'edit'])->name('modules.edit');
        Route::put('/modules/{module}', [ModuleController::class, 'update'])->name('modules.update');
        Route::delete('/modules/{module}', [ModuleController::class, 'destroy'])->name('modules.destroy');
    
        Route::get('/modules/{module}/default-exam-config', [ModuleController::class, 'getDefaultExamConfig'])->name('modules.default-exam-config');
    
        Route::get('/modules/{module}/exam-configs', [ModuleExamRoomConfigController::class, 'index']) // <<< ADD
        ->name('modules.exam-configs.index'); // This is the page module cards will link to

        Route::post('/modules/{module}/exam-configs', [ModuleExamRoomConfigController::class, 'store']) // <<< ADD
            ->name('modules.exam-configs.store');

        Route::put('/module-exam-room-configs/{config}', [ModuleExamRoomConfigController::class, 'update']) // <<< ADD
            ->name('module-exam-configs.update')
            ->setBindingFields(['config' => 'id']); // Ensures {config} binds by ID

        Route::delete('/module-exam-room-configs/{config}', [ModuleExamRoomConfigController::class, 'destroy']) // <<< ADD
            ->name('module-exam-configs.destroy')
            ->setBindingFields(['config' => 'id']);
    
        Route::post('/select-academic-year', function(Request $request) {
            $validated = $request->validate(['annee_uni_id' => 'required|exists:annee_unis,id']);
            session(['selected_annee_uni_id' => (int)$validated['annee_uni_id']]);
            return back(); // Or redirect()->intended()
        })->name('academic-year.select');
    
        Route::post('/sesons/{seson}/batch-assign-exams', [SesonController::class, 'batchAssignExams']) // <<< ADD THIS
        ->name('sesons.batch-assign-exams');  
    
        Route::post('/sesons/{seson}/approve-notifications', [App\Http\Controllers\Admin\SesonNotificationController::class, 'approveAndDispatchNotifications'])
            ->name('sesons.approve-notifications');
    });

    // Group for routes accessible by Admin OR RH
    Route::prefix('admin')->name('admin.')->middleware('can:is_admin_or_rh')->group(function() {
        Route::resource('unavailabilities', UnavailabilityController::class)->parameters(['unavailabilities' => 'unavailability'])->except(['show']);
        // Any other routes shared between Admin and RH go here
    });

    // Group for routes accessible ONLY by Admin
    Route::prefix('admin')->name('admin.')->middleware('can:is_admin')->group(function() {
        Route::resource('users', UserController::class)->except(['show']);
        // ... all other admin-only resources
    });

    Route::get('/notifications/pending-count', [NotificationController::class, 'getPendingCount'])->name('notifications.pendingCount');
    Route::get('/notifications/latest', [NotificationController::class, 'getLatest'])->name('notifications.latest');
    Route::post('/notifications/mark-read/{notification?}', [NotificationController::class, 'markAsRead'])->name('notifications.markRead');

    Route::middleware(['can:is_professeur']) 
        ->prefix('professeur')
        ->name('professeur.')
        ->group(function () {
            Route::get('/my-schedule', [ProfessorScheduleController::class, 'index'])->name('schedule.index');
            Route::get('/dashboard', [ProfessorDashboardController::class, 'index'])->name('dashboard');
            Route::get('/my-unavailabilities', [ProfessorUnavailabilityController::class, 'index'])->name('unavailabilities.index');
            Route::get('/exchanges', [ProfessorExchangeController::class, 'index'])->name('exchanges.index');
            Route::post('/exchanges/request', [ProfessorExchangeController::class, 'storeRequest'])->name('exchanges.storeRequest');
            Route::get('/exchanges/swappable-assignments/{echange}', [ProfessorExchangeController::class, 'getSwappableAssignments'])->name('exchanges.swappableAssignments');
            Route::post('/exchanges/{echange}/propose', [ProfessorExchangeController::class, 'proposeSwap'])->name('exchanges.propose');
            Route::post('/exchanges/{echange}/cancel-request', [ProfessorExchangeController::class, 'cancelRequest'])->name('exchanges.cancelRequest');
            Route::post('/exchanges/{echange}/withdraw-proposal', [ProfessorExchangeController::class, 'withdrawProposal'])->name('exchanges.withdrawProposal');
            Route::post('/exchanges/{echange}/accept', [ProfessorExchangeController::class, 'acceptSwap'])->name('exchanges.accept');
            Route::post('/exchanges/{echange}/refuse', [ProfessorExchangeController::class, 'refuseSwap'])->name('exchanges.refuse');
            Route::get('/exchanges/updates-summary', [ProfessorExchangeController::class, 'getUpdatesSummary'])->name('exchanges.updatesSummary');
    });

    // CHEF DE SERVICE ROUTES
    Route::middleware(['can:is_chef_service']) // Use your existing Gate
        ->prefix('chef-service')
        ->name('chef_service.')
        ->group(function () {
            Route::get('/professor-schedules', [ChefServiceProfessorScheduleController::class, 'index'])->name('professor_schedules.index');
            // Potentially a dashboard for Chef de Service later
            // Route::get('/dashboard', [ChefServiceDashboardController::class, 'index'])->name('dashboard');
        });

    // In routes/web.php, within the main authenticated group
    Route::middleware(['can:is_rh']) // Use your existing Gate for RH
        ->prefix('rh')
        ->name('rh.')
        ->group(function () {
            Route::get('/dashboard', [RHDashboardController::class, 'index'])->name('dashboard');
        });
}); 

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
