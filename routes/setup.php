<?php

use App\Http\Controllers\SetupLogsheet\SetupChecklistController;
use App\Http\Controllers\SetupLogsheet\SetupChecklistItemController;
use App\Http\Middleware\AuthMiddleware;
use Illuminate\Support\Facades\Route;

$app_name = env('APP_NAME', '');

Route::prefix($app_name)
  ->middleware(AuthMiddleware::class)
  ->group(function () {


    //Checklist Items Routes
    Route::get("/setup-checklist", [SetupChecklistItemController::class, 'index'])
      ->name('check_item.index');

    Route::post("/setup-checklist-store-item", [SetupChecklistItemController::class, 'store'])
      ->name('check_item.store');

    Route::put("/setup-checklist-edit-item/{id}", [SetupChecklistItemController::class, 'update'])
      ->name('check_item.update');

    Route::delete('/setup-checklist-delete-item/{id}', [SetupChecklistItemController::class, 'destroy'])
      ->name('check_item.delete');



    //Checklist Routes fillable items
    Route::get("/setup-checklist-index", [SetupChecklistController::class, 'index'])
      ->name('setup-new.checklist.index');

    Route::post("/setup-checklist-store", [SetupChecklistController::class, 'store'])
      ->name('setup.checklist.store');

    // Fetch setup details (for PositiveChecklist)
    Route::get('/setup-checklist/{id}', [SetupChecklistController::class, 'show'])
      ->name('setup.checklist.show');

    Route::get('/setup-checklist/{setup_log_id}/positive', [SetupChecklistController::class, 'positive'])
      ->name('setup.checklist.positive');

    Route::put('/setup-checklist/qverify/{setup_log_id}', [SetupChecklistController::class, 'verify'])
      ->name('setup.checklist.verify');
  });
