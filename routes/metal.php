<?php

use App\Http\Controllers\metalMagazine\MetalTubeMagazineController;
use App\Http\Middleware\AuthMiddleware;
use Illuminate\Support\Facades\Route;

$app_name = env('APP_NAME', '');

Route::prefix($app_name)
  ->middleware(AuthMiddleware::class)
  ->group(function () {


    //Checklist Items Routes
    Route::get("/cleaning-logsheet-index", [MetalTubeMagazineController::class, 'index'])
      ->name('cleaning.logsheet.index');

    Route::post("/cleaning-logsheet/store", [MetalTubeMagazineController::class, 'store'])->name('cleaning.logsheet.store');

    Route::put("/cleaning-logsheet-verify/{id}", [MetalTubeMagazineController::class, 'verify'])
      ->name('cleaning.logsheet.verify');
  });
