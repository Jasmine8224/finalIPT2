<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index()
    {
        $years = AcademicYear::orderByDesc('start_year')->get();
        $archivedYears = AcademicYear::onlyTrashed()->orderByDesc('start_year')->get();
        $archivedStudents = Student::onlyTrashed()->with(['department', 'course', 'academicYear'])->orderBy('full_name')->get();
        $archivedFaculties = Faculty::onlyTrashed()->with(['department'])->orderBy('full_name')->get();
        $archivedCourses = Course::onlyTrashed()->orderBy('code')->get();
        $archivedDepartments = Department::onlyTrashed()->orderBy('code')->get();
        $archivedProfiles = User::onlyTrashed()->orderBy('name')->get();
        
        // Combine all archived items for the Security tab
        $archivedItems = [
            'profiles' => $archivedProfiles,
            'students' => $archivedStudents,
            'faculties' => $archivedFaculties,
            'courses' => $archivedCourses,
            'departments' => $archivedDepartments,
            'academic_years' => $archivedYears
        ];
        
        return view('layouts.admin-react', compact('years', 'archivedYears', 'archivedStudents', 'archivedFaculties', 'archivedCourses', 'archivedDepartments', 'archivedProfiles', 'archivedItems'));
    }

    public function update(Request $request)
    {
        // Handle settings updates
        return redirect()->back()->with('success', 'Settings updated successfully');
    }

    public function restoreProfile($id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();
        
        return redirect()->back()->with('success', 'Profile restored successfully');
    }

    public function forceDeleteProfile($id)
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->forceDelete();
        
        return redirect()->back()->with('success', 'Profile permanently deleted');
    }

    public function restoreStudent($id)
    {
        try {
            $student = Student::onlyTrashed()->findOrFail($id);
            $student->restore();
            
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Student restored successfully'
                ]);
            }
            
            return redirect()->back()->with('success', 'Student restored successfully');
        } catch (\Exception $e) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error restoring student: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Error restoring student');
        }
    }

    public function forceDeleteStudent($id)
    {
        try {
            $student = Student::onlyTrashed()->findOrFail($id);
            $student->forceDelete();
            
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Student permanently deleted'
                ]);
            }
            
            return redirect()->back()->with('success', 'Student permanently deleted');
        } catch (\Exception $e) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error deleting student: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Error deleting student');
        }
    }

    public function restoreFaculty($id)
    {
        try {
            $faculty = Faculty::onlyTrashed()->findOrFail($id);
            $faculty->restore();
            
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Faculty restored successfully'
                ]);
            }
            
            return redirect()->back()->with('success', 'Faculty restored successfully');
        } catch (\Exception $e) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error restoring faculty: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Error restoring faculty');
        }
    }

    public function forceDeleteFaculty($id)
    {
        try {
            $faculty = Faculty::onlyTrashed()->findOrFail($id);
            $faculty->forceDelete();
            
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Faculty permanently deleted'
                ]);
            }
            
            return redirect()->back()->with('success', 'Faculty permanently deleted');
        } catch (\Exception $e) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error deleting faculty: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Error deleting faculty');
        }
    }

    public function archiveCourse($id)
    {
        try {
            $course = Course::findOrFail($id);
            $course->delete(); // This will soft delete the course
            
            return response()->json(['message' => 'Course archived successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error archiving course'], 500);
        }
    }

    public function archiveDepartment($id)
    {
        try {
            $department = Department::findOrFail($id);
            $department->delete(); // This will soft delete the department
            
            return response()->json(['message' => 'Department archived successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error archiving department'], 500);
        }
    }

    public function restoreCourse($id)
    {
        try {
            $course = Course::onlyTrashed()->findOrFail($id);
            $course->restore();
            
            return response()->json(['message' => 'Course restored successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error restoring course'], 500);
        }
    }

    public function forceDeleteCourse($id)
    {
        try {
            $course = Course::onlyTrashed()->findOrFail($id);
            $course->forceDelete();
            
            return response()->json(['message' => 'Course permanently deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting course'], 500);
        }
    }

    public function restoreDepartment($id)
    {
        try {
            $department = Department::onlyTrashed()->findOrFail($id);
            $department->restore();
            
            return response()->json(['message' => 'Department restored successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error restoring department'], 500);
        }
    }

    public function forceDeleteDepartment($id)
    {
        try {
            $department = Department::onlyTrashed()->findOrFail($id);
            $department->forceDelete();
            
            return response()->json(['message' => 'Department permanently deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting department'], 500);
        }
    }

    public function archiveAcademicYear($id)
    {
        try {
            $academicYear = AcademicYear::findOrFail($id);
            $academicYear->delete(); // This will soft delete the academic year
            
            return response()->json(['message' => 'Academic year archived successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error archiving academic year'], 500);
        }
    }

    public function restoreAcademicYear($id)
    {
        try {
            $academicYear = AcademicYear::onlyTrashed()->findOrFail($id);
            $academicYear->restore();
            
            return response()->json(['message' => 'Academic year restored successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error restoring academic year'], 500);
        }
    }

    public function forceDeleteAcademicYear($id)
    {
        try {
            $academicYear = AcademicYear::onlyTrashed()->findOrFail($id);
            $academicYear->forceDelete();
            
            return response()->json(['message' => 'Academic year permanently deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting academic year'], 500);
        }
    }
}
