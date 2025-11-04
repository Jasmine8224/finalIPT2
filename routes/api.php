<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\FacultyController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\SettingsController;

// Admin API routes (stateless; used by the React admin UI)
Route::prefix('admin')->name('api.admin.')->group(function () {
    Route::get('/dashboard-stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');
    Route::get('/dashboard-activity', [DashboardController::class, 'getActivity'])->name('dashboard.activity');
    Route::get('/students', [StudentController::class, 'apiIndex'])->name('students.api');
    Route::post('/students', [StudentController::class, 'apiStore'])->name('students.store');
    Route::put('/students/{student}', [StudentController::class, 'apiUpdate'])->name('students.update');
    Route::patch('/students/{student}/archive', [StudentController::class, 'archive'])->name('students.archive');
    Route::get('/faculties', [FacultyController::class, 'apiIndex'])->name('faculties.api');
    Route::post('/faculties', [FacultyController::class, 'apiStore'])->name('faculties.store');
    Route::put('/faculties/{faculty}', [FacultyController::class, 'apiUpdate'])->name('faculties.update');
    Route::patch('/faculties/{faculty}/archive', [FacultyController::class, 'archive'])->name('faculties.archive');
    Route::get('/courses', [CourseController::class, 'apiIndex'])->name('courses.api');
    Route::post('/courses', [CourseController::class, 'apiStore'])->name('courses.store');
    Route::put('/courses/{course}', [CourseController::class, 'apiUpdate'])->name('courses.update');
    Route::patch('/courses/{course}/archive', [CourseController::class, 'archive'])->name('courses.archive');
    Route::get('/departments', [DepartmentController::class, 'apiIndex'])->name('departments.api');
    Route::post('/departments', [DepartmentController::class, 'apiStore'])->name('departments.store');
    Route::put('/departments/{department}', [DepartmentController::class, 'apiUpdate'])->name('departments.update');
    Route::patch('/departments/{department}/archive', [DepartmentController::class, 'archive'])->name('departments.archive');
    Route::get('/reports', [ReportController::class, 'apiIndex'])->name('reports.api');
    // Settings/profile and archive/restore endpoints
    Route::post('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'update'])->name('settings.update');

    // Security tab restoration routes
    Route::post('/settings/profiles/{id}/restore', [\App\Http\Controllers\Admin\SettingsController::class, 'restoreProfile'])->name('settings.profiles.restore');
    Route::delete('/settings/profiles/{id}/force-delete', [\App\Http\Controllers\Admin\SettingsController::class, 'forceDeleteProfile'])->name('settings.profiles.force-delete');
    Route::post('/settings/students/{id}/restore', [\App\Http\Controllers\Admin\SettingsController::class, 'restoreStudent'])->name('settings.students.restore');
    Route::delete('/settings/students/{id}/force-delete', [\App\Http\Controllers\Admin\SettingsController::class, 'forceDeleteStudent'])->name('settings.students.force-delete');
    Route::post('/settings/faculties/{id}/restore', [\App\Http\Controllers\Admin\SettingsController::class, 'restoreFaculty'])->name('settings.faculties.restore');
    Route::delete('/settings/faculties/{id}/force-delete', [\App\Http\Controllers\Admin\SettingsController::class, 'forceDeleteFaculty'])->name('settings.faculties.force-delete');
    
    // Archive routes for courses and departments
    Route::post('/settings/courses/{id}/archive', [\App\Http\Controllers\Admin\SettingsController::class, 'archiveCourse'])->name('settings.courses.archive');
    Route::post('/settings/departments/{id}/archive', [\App\Http\Controllers\Admin\SettingsController::class, 'archiveDepartment'])->name('settings.departments.archive');
    
    // Restore and force delete routes for courses and departments
    Route::post('/settings/courses/{id}/restore', [\App\Http\Controllers\Admin\SettingsController::class, 'restoreCourse'])->name('settings.courses.restore');
    Route::delete('/settings/courses/{id}/force-delete', [\App\Http\Controllers\Admin\SettingsController::class, 'forceDeleteCourse'])->name('settings.courses.force-delete');
    Route::post('/settings/departments/{id}/restore', [\App\Http\Controllers\Admin\SettingsController::class, 'restoreDepartment'])->name('settings.departments.restore');
    Route::delete('/settings/departments/{id}/force-delete', [\App\Http\Controllers\Admin\SettingsController::class, 'forceDeleteDepartment'])->name('settings.departments.force-delete');
    
    // Academic year archive routes
    Route::post('/settings/academic-years/{id}/archive', [\App\Http\Controllers\Admin\SettingsController::class, 'archiveAcademicYear'])->name('settings.academic-years.archive');
    Route::post('/settings/academic-years/{id}/restore', [\App\Http\Controllers\Admin\SettingsController::class, 'restoreAcademicYear'])->name('settings.academic-years.restore');
    Route::delete('/settings/academic-years/{id}/force-delete', [\App\Http\Controllers\Admin\SettingsController::class, 'forceDeleteAcademicYear'])->name('settings.academic-years.force-delete');
    Route::get('/academic-years', function() {
        try {
            $academicYears = \App\Models\AcademicYear::orderByDesc('start_year')->get(['id', 'start_year', 'end_year', 'status']);
            return response()->json($academicYears);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    })->name('academic-years.api');
    Route::post('/academic-years', function(\Illuminate\Http\Request $request) {
        try {
            $data = $request->validate([
                'start_year' => 'required|integer|unique:academic_years,start_year',
                'end_year' => 'required|integer|gt:start_year',
                'status' => 'nullable|string|max:24',
            ]);

            $academicYear = \App\Models\AcademicYear::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Academic year created successfully',
                'academic_year' => $academicYear
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating academic year: ' . $e->getMessage()
            ], 500);
        }
    })->name('academic-years.store');
    Route::put('/academic-years/{academicYear}', function(\Illuminate\Http\Request $request, \App\Models\AcademicYear $academicYear) {
        try {
            $data = $request->validate([
                'start_year' => 'required|integer|unique:academic_years,start_year,' . $academicYear->id,
                'end_year' => 'required|integer|gt:start_year',
                'status' => 'nullable|string|max:24',
            ]);

            $academicYear->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Academic year updated successfully',
                'academic_year' => $academicYear
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating academic year: ' . $e->getMessage()
            ], 500);
        }
    })->name('academic-years.update');
});

// Simple API endpoints for dropdowns (temporarily without auth for testing)
Route::prefix('/')->group(function () {
    Route::get('/departments', function () {
        try {
            $departments = \App\Models\Department::orderBy('name')->get(['id', 'name', 'code']);
            return response()->json($departments);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
    Route::get('/courses', function () {
        try {
            $courses = \App\Models\Course::with('department')->orderBy('title')->get(['id', 'title', 'code', 'department_id']);
            return response()->json($courses);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
});
