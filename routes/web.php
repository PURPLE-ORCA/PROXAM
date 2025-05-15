<?php

use App\Http\Controllers\ModuleController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
    });


    
}); 

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';