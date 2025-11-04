<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Department;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'students' => Student::whereNull('deleted_at')->count(),
            'faculties' => Faculty::whereNull('deleted_at')->count(),
            'courses' => Course::whereNull('deleted_at')->count(),
            'departments' => Department::whereNull('deleted_at')->count(),
        ];

        return view('layouts.admin-react', compact('stats'));
    }

    public function getStats()
    {
        return response()->json([
            'students' => Student::whereNull('deleted_at')->count(),
            'faculties' => Faculty::whereNull('deleted_at')->count(),
            'courses' => Course::whereNull('deleted_at')->count(),
            'departments' => Department::whereNull('deleted_at')->count(),
        ]);
    }

    /**
     * Return simple recent activity counts for today.
     */
    public function getActivity()
    {
        $today = now()->toDateString();

        return response()->json([
            'today' => [
                'students_added' => Student::whereNull('deleted_at')->whereDate('created_at', $today)->count(),
                'faculties_added' => Faculty::whereNull('deleted_at')->whereDate('created_at', $today)->count(),
                'departments_added' => Department::whereNull('deleted_at')->whereDate('created_at', $today)->count(),
                'courses_added' => Course::whereNull('deleted_at')->whereDate('created_at', $today)->count(),
            ],
            'ts' => now()->toISOString(),
        ]);
    }
}
