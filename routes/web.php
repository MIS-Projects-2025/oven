<?php

use App\Http\Controllers\DemoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$app_name = env('APP_NAME', '');

// Authentication routes
require __DIR__ . '/auth.php';

// General routes
require __DIR__ . '/general.php';

// setup routes
require __DIR__ . '/setup.php';

// positive routes
require __DIR__ . '/positive.php';

// qape routes
require __DIR__ . '/qape.php';

// table routes
require __DIR__ . '/table.php';

// metal routes
require __DIR__ . '/metal.php';

// capacity routes
require __DIR__ . '/capacity.php';

Route::get("/demo", [DemoController::class, 'index'])->name('demo');

Route::fallback(function () {
    return Inertia::render('404');
})->name('404');
