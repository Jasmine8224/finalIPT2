<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Department;
use App\Models\AcademicYear;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->input('type', 'students');
        $departmentId = $request->input('department_id');
        $courseId = $request->input('course_id');
        $selectedYear = $request->input('academic_year_id');

        $years = AcademicYear::orderByDesc('start_year')->get();
        $departments = Department::orderBy('name')->get(['id','name']);
        $courses = Course::orderBy('title')->get(['id','title']);

        // Build results based on type
        $results = collect();
        $summary = [];
        if ($type === 'students') {
            $query = Student::with(['department','course','academicYear']);
            if ($departmentId) $query->where('department_id', $departmentId);
            if ($courseId) $query->where('course_id', $courseId);
            $results = $query->orderBy('full_name')->paginate(10)->withQueryString();
            $summary = [
                'Department' => optional(Department::find($departmentId))->name ?: 'All',
                'Course' => optional(Course::find($courseId))->title ?: 'All',
            ];
        } elseif ($type === 'faculties') {
            $query = Faculty::with('department');
            if ($departmentId) $query->where('department_id', $departmentId);
            $results = $query->orderBy('full_name')->paginate(10)->withQueryString();
            $summary = [
                'Department' => optional(Department::find($departmentId))->name ?: 'All',
            ];
        } elseif ($type === 'courses') {
            $query = Course::with('department');
            if ($departmentId) $query->where('department_id', $departmentId);
            $results = $query->orderBy('code')->paginate(10)->withQueryString();
            $summary = [
                'Department' => optional(Department::find($departmentId))->name ?: 'All',
            ];
        } else { // departments
            $results = Department::orderBy('code')->paginate(10)->withQueryString();
        }

        return view('layouts.admin-react', compact(
            'type','departmentId','courseId','years','selectedYear','departments','courses','results','summary'
        ));
    }

    public function export(string $type)
    {
        // Placeholder – can be wired to CSV/Excel later
        $dept = request('department_id');
        $course = request('course_id');
        $msg = strtoupper($type).' report will be generated'.
            ($dept ? ' for Department ID '.$dept : '').
            ($course ? ' and Course ID '.$course : '');
        return back()->with('success', $msg);
    }

    /**
     * API method to get reports data for React components
     */
    public function apiIndex(Request $request)
    {
        $type = $request->input('type', 'students');
        $departmentId = $request->input('department_id');
        $courseId = $request->input('course_id');

        $results = collect();
        if ($type === 'students') {
            $query = Student::with(['department','course','academicYear']);
            if ($departmentId) $query->where('department_id', $departmentId);
            if ($courseId) $query->where('course_id', $courseId);
            $results = $query->orderBy('full_name')->paginate(10)->withQueryString();
        } elseif ($type === 'faculties') {
            $query = Faculty::with('department');
            if ($departmentId) $query->where('department_id', $departmentId);
            $results = $query->orderBy('full_name')->paginate(10)->withQueryString();
        } elseif ($type === 'courses') {
            $query = Course::with('department');
            if ($departmentId) $query->where('department_id', $departmentId);
            $results = $query->orderBy('code')->paginate(10)->withQueryString();
        } else {
            $results = Department::orderBy('code')->paginate(10)->withQueryString();
        }

        return response()->json([
            'results' => $results->items(),
            'summary' => [
                'type' => $type,
                'department_id' => $departmentId,
                'course_id' => $courseId,
                'total' => $results->total()
            ],
            'pagination' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total()
            ]
        ]);
    }
}
