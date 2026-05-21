<?php

use App\Http\Controllers\Capability\CapabilityMatrixController;
use App\Http\Controllers\General\AdminController;
use App\Http\Controllers\General\ProfileController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\AuthMiddleware;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

$app_name = env('APP_NAME', '');

Route::redirect('/', "/$app_name");

Route::prefix($app_name)->middleware(AuthMiddleware::class)->group(function () {

  Route::get("/capability/matrix", [CapabilityMatrixController::class, 'index'])->name('capability.matrix.index');

  Route::get('/capability-matrix/export', [CapabilityMatrixController::class, 'export'])
    ->name('capability.matrix.export');

  Route::post('/capability-matrix', [CapabilityMatrixController::class, 'store'])->name('capability-matrix.store');

  Route::put('/capability-matrix/update/{id}', [CapabilityMatrixController::class, 'update'])
    ->name('capability.matrix.update');

  Route::delete('/capability-matrix/delete/{id}', [CapabilityMatrixController::class, 'destroy'])
    ->name('capability.matrix.destroy');
});
