<?php

use App\Http\Controllers\TableChecklist\ChecklistItemsController;
use App\Http\Controllers\TableChecklist\LocationListController;
use App\Http\Controllers\TableChecklist\TableChecklistController;
use App\Http\Controllers\TableChecklist\TableChecklistItemController;
use App\Http\Controllers\TableChecklist\TableListController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\AuthMiddleware;
use Illuminate\Support\Facades\Route;

$app_name = env('APP_NAME', '');

Route::redirect('/', "/$app_name");

Route::prefix($app_name)->middleware(AuthMiddleware::class)->group(function () {

    Route::middleware(AdminMiddleware::class)->group(function () {
        // Table Checklist Item Routes
        Route::get("/table/checklist/item/index", [TableChecklistItemController::class, 'index'])->name('checklist_item.index');
        Route::post("/table/checklist/item/store", [TableChecklistItemController::class, 'store'])->name('checklist_item.store');
        Route::put("/table/checklist/item/update/{id}", [TableChecklistItemController::class, 'update'])->name('checklist_item.update');
        Route::delete("/table/checklist/item/delete/{id}", [TableChecklistItemController::class, 'destroy'])->name('checklist_item.destroy');

        Route::get("/table/checklist/item", [ChecklistItemsController::class, 'index'])->name('checklist.item');
        Route::post("/bulk/checklist/item/store", [ChecklistItemsController::class, 'store'])->name('checklist.store.bulk');
        Route::put('/checklist/item/{id}', [ChecklistItemsController::class, 'update'])->name('checklist.item.update');


        // Table List Route
        Route::get("/table/list/index", [TableListController::class, 'index'])->name('table.list.index');
        Route::post("/table/list/store", [TableListController::class, 'store'])->name('table.list.store');
        Route::put("/table/list/update/{id}", [TableListController::class, 'update'])->name('table.list.update');
        Route::delete("/table/list/delete/{id}", [TableListController::class, 'destroy'])->name('table.list.destroy');

        // location List Route
        Route::get("/location/list/index", [LocationListController::class, 'index'])->name('location.list.index');
        Route::post("/location/list/store", [LocationListController::class, 'store'])->name('location.list.store');
        Route::put("/location/list/update/{id}", [LocationListController::class, 'update'])->name('location.list.update');
        Route::delete("/location/list/delete/{id}", [LocationListController::class, 'destroy'])->name('location.list.destroy');
    });

    // Table Checklist Routes
    Route::get("/table/checklist/index", [TableChecklistController::class, 'index'])->name('table.checklist.index');
    Route::post("/table/checklist/store", [TableChecklistController::class, 'store'])->name('table.checklist.store');
    Route::put("/table/checklist/update/{id}", [TableChecklistController::class, 'update'])->name('table.checklist.update');
    Route::delete("/table/checklist/delete/{id}", [TableChecklistController::class, 'destroy'])->name('table.checklist.destroy');
    Route::get('/table-checklist/view', [TableChecklistController::class, 'view'])->name('table.checklist.view');
});
