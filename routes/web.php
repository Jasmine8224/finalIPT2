<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\FacultyController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\ProfileController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    // Always show the public landing page at root, even if logged in
    return view('welcome');
});

Auth::routes();

// Logout route
Route::post('/logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect()->route('login');
})->name('logout');

// Admin Routes - Using proper individual controllers
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard routes
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');
    
    // Student management routes (page-rendering GETs only)
    Route::resource('students', StudentController::class)->only(['index', 'create', 'show', 'edit']);
    
    // Faculty management routes (page-rendering GETs only)
    Route::resource('faculties', FacultyController::class)->only(['index', 'create', 'show', 'edit']);
    
    // Course management routes (page-rendering GETs only)
    Route::resource('courses', CourseController::class)->only(['index', 'create', 'show', 'edit']);
    
    // Department management routes (page-rendering GETs only)
    Route::resource('departments', DepartmentController::class)->only(['index', 'create', 'show', 'edit']);
    
    // Report routes
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    
    // Settings routes (GET page only) — non-GET actions were moved to API
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    
    // Settings restore and delete routes
    Route::post('/settings/profiles/{id}/restore', [SettingsController::class, 'restoreProfile'])->name('settings.profiles.restore');
    Route::delete('/settings/profiles/{id}/force-delete', [SettingsController::class, 'forceDeleteProfile'])->name('settings.profiles.force-delete');
    Route::post('/settings/students/{id}/restore', [SettingsController::class, 'restoreStudent'])->name('settings.students.restore');
    Route::delete('/settings/students/{id}/force-delete', [SettingsController::class, 'forceDeleteStudent'])->name('settings.students.force-delete');
    Route::post('/settings/faculties/{id}/restore', [SettingsController::class, 'restoreFaculty'])->name('settings.faculties.restore');
    Route::delete('/settings/faculties/{id}/force-delete', [SettingsController::class, 'forceDeleteFaculty'])->name('settings.faculties.force-delete');
    Route::post('/settings/courses/{id}/restore', [SettingsController::class, 'restoreCourse'])->name('settings.courses.restore');
    Route::delete('/settings/courses/{id}/force-delete', [SettingsController::class, 'forceDeleteCourse'])->name('settings.courses.force-delete');
    Route::post('/settings/departments/{id}/restore', [SettingsController::class, 'restoreDepartment'])->name('settings.departments.restore');
    Route::delete('/settings/departments/{id}/force-delete', [SettingsController::class, 'forceDeleteDepartment'])->name('settings.departments.force-delete');
    Route::post('/settings/academic-years/{id}/restore', [SettingsController::class, 'restoreAcademicYear'])->name('settings.academic-years.restore');
    Route::delete('/settings/academic-years/{id}/force-delete', [SettingsController::class, 'forceDeleteAcademicYear'])->name('settings.academic-years.force-delete');
    
    // Profile routes (GET page only) — update/archive moved to API
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile.index');

    // (removed here; relocated below outside /admin group)
});

// Session-authenticated API shim so JS can call /api/admin/profile with cookies
Route::middleware(['auth'])->prefix('api/admin')->name('api.admin.')->group(function () {
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile/archive', [ProfileController::class, 'archive'])->name('profile.archive');
});

// NOTE: API routes (previously here) were moved to routes/api.php
