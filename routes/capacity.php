<?php

use App\Http\Controllers\Capacity\CapacityController;
use App\Http\Middleware\AuthMiddleware;
use Illuminate\Support\Facades\Route;

$app_name = env('APP_NAME', '');

Route::prefix($app_name)
  ->middleware(AuthMiddleware::class)
  ->group(function () {


    //Checklist Items Routes
    Route::get("/capacity-index", [CapacityController::class, 'index'])
      ->name('capacity.index');

    //para to sa pagfilter ng options sa package type dropdown, para naman di na magload lahat ng options sa simula diba kaibigang Oso? xD
    Route::get('/capacity/filtered-options', [CapacityController::class, 'getFilteredOptions'])
      ->name('capacity.filtered-options');

    Route::post("/capacity/store", [CapacityController::class, 'store'])->name('capacity.store');

    Route::put("/capacity-verify/{id}", [CapacityController::class, 'verify'])
      ->name('capacity.verify');
  });
