<?php

use App\Http\Controllers\DemoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$app_name = env('APP_NAME', '');

// Authentication routes
require __DIR__ . '/auth.php';

// General routes
require __DIR__ . '/general.php';

// Capability routes
require __DIR__ . '/capability.php';

Route::get("/demo", [DemoController::class, 'index'])->name('demo');

Route::fallback(function () {
    return Inertia::render('404');
})->name('404');
