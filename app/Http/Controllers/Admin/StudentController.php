<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Department;
use App\Models\Course;
use App\Models\AcademicYear;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $q = request('q');
        $department_filter = request('department_filter');
        $course_filter = request('course_filter');
        
        $students = Student::with(['department', 'course', 'academicYear'])
            ->when($q, function($query) use ($q) {
                $query->where('full_name', 'like', "%$q%");
                $query->orWhere('email', 'like', "%$q%");
            })
            ->when($department_filter, function($query) use ($department_filter) {
                $query->where('department_id', $department_filter);
            })
            ->when($course_filter, function($query) use ($course_filter) {
                $query->where('course_id', $course_filter);
            })
            ->orderBy('full_name')
            ->paginate(10)
            ->withQueryString();

        // Get filter options
        $departments = Department::orderBy('name')->pluck('name', 'id');
        $courses = Course::orderBy('title')->pluck('title', 'id');

        return view('layouts.admin-react', compact('students', 'q', 'departments', 'courses', 'department_filter', 'course_filter'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $departments = Department::orderBy('name')->pluck('name','id');
        $courses = Course::orderBy('title')->pluck('title','id');
        $academicYears = AcademicYear::orderByDesc('start_year')->get()->mapWithKeys(function($ay){
            return [$ay->id => $ay->start_year.' - '.$ay->end_year];
        });
        return view('layouts.admin-react', compact('departments','courses','academicYears'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'full_name'   => 'required|string|max:200',
            'suffix'      => 'nullable|string|max:20',
            'sex'         => 'required|string|max:16',
            'birthdate'   => 'nullable|date',
            'email'       => 'required|email|max:255|unique:users,email',
            'contact_number' => 'nullable|string|max:50',
            'address'     => 'nullable|string',
            'course_id'   => 'nullable|exists:courses,id',
            'department_id' => 'nullable|exists:departments,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'status'      => 'nullable|string|max:24',
        ]);

        // Create a linked user account (required by schema)
        $user = User::create([
            'name' => $data['full_name'],
            'email' => $data['email'],
            'password' => Hash::make('password'),
        ]);
        if ($user) {
            if ($role = Role::where('name', 'student')->first()) {
                $user->roles()->syncWithoutDetaching([$role->id]);
            }
            $data['user_id'] = $user->id;
        }

        Student::create($data);

        return redirect()->route('admin.students.index')->with('success', 'Student created.');
    }

    /**
     * Store student via API (for React forms)
     */
    public function apiStore(Request $request)
    {
        try {
            $data = $request->validate([
                'full_name'   => 'required|string|max:200',
                'suffix'      => 'nullable|string|max:20',
                'sex'         => 'required|string|max:16',
                'birthdate'   => 'nullable|date',
                'email'       => 'required|email|max:255|unique:users,email',
                'contact_number' => 'nullable|string|max:50',
                'address'     => 'nullable|string',
                'course_id'   => 'nullable|exists:courses,id',
                'department_id' => 'nullable|exists:departments,id',
                'academic_year_id' => 'nullable|exists:academic_years,id',
                'status'      => 'nullable|string|max:24',
            ]);

            // Create a linked user account
            $user = User::create([
                'name' => $data['full_name'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
            ]);
            if ($user) {
                if ($role = Role::where('name', 'student')->first()) {
                    $user->roles()->syncWithoutDetaching([$role->id]);
                }
                $data['user_id'] = $user->id;
            }

            $student = Student::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Student created successfully',
                'student' => $student->load(['department', 'course', 'academicYear'])
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
                'message' => 'Error creating student: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Http\Response
     */
    public function show(Student $student)
    {
        return redirect()->route('admin.students.edit', $student);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Http\Response
     */
    public function edit(Student $student)
    {
        $departments = Department::orderBy('name')->pluck('name','id');
        $courses = Course::orderBy('title')->pluck('title','id');
        $academicYears = AcademicYear::orderByDesc('start_year')->get()->mapWithKeys(function($ay){
            return [$ay->id => $ay->start_year.' - '.$ay->end_year];
        });
        return view('layouts.admin-react', compact('student','departments','courses','academicYears'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Student $student)
    {
        $data = $request->validate([
            'full_name'   => 'required|string|max:200',
            'suffix'      => 'nullable|string|max:20',
            'sex'         => 'required|string|max:16',
            'birthdate'   => 'nullable|date',
            'email'       => 'required|email|max:255|unique:users,email,' . ($student->user_id ?? 'NULL'),
            'contact_number' => 'nullable|string|max:50',
            'address'     => 'nullable|string',
            'course_id'   => 'nullable|exists:courses,id',
            'department_id' => 'nullable|exists:departments,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'status'      => 'nullable|string|max:24',
        ]);

        // Ensure linked user exists and is updated
        if ($student->user_id) {
            $user = User::find($student->user_id);
            if ($user) {
                $user->update([
                    'name' => $data['full_name'],
                    'email' => $data['email'],
                ]);
            }
        } else {
            $user = User::create([
                'name' => $data['full_name'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
            ]);
            if ($role = Role::where('name', 'student')->first()) {
                $user->roles()->syncWithoutDetaching([$role->id]);
            }
            $data['user_id'] = $user->id;
        }

        $student->update($data);

        return redirect()->route('admin.students.index')->with('success', 'Student updated.');
    }

    /**
     * Update student via API (for React forms)
     */
    public function apiUpdate(Request $request, Student $student)
    {
        try {
            $data = $request->validate([
                'full_name'   => 'required|string|max:200',
                'suffix'      => 'nullable|string|max:20',
                'sex'         => 'required|string|max:16',
                'birthdate'   => 'nullable|date',
                'email'       => 'required|email|max:255|unique:users,email,' . ($student->user_id ?? 'NULL'),
                'contact_number' => 'nullable|string|max:50',
                'address'     => 'nullable|string',
                'course_id'   => 'nullable|exists:courses,id',
                'department_id' => 'nullable|exists:departments,id',
                'academic_year_id' => 'nullable|exists:academic_years,id',
                'status'      => 'nullable|string|max:24',
            ]);

            // Ensure linked user exists and is updated
            if ($student->user_id) {
                $user = User::find($student->user_id);
                if ($user) {
                    $user->update([
                        'name' => $data['full_name'],
                        'email' => $data['email'],
                    ]);
                }
            } else {
                $user = User::create([
                    'name' => $data['full_name'],
                    'email' => $data['email'],
                    'password' => Hash::make('password'),
                ]);
                if ($role = Role::where('name', 'student')->first()) {
                    $user->roles()->syncWithoutDetaching([$role->id]);
                }
                $data['user_id'] = $user->id;
            }

            $student->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Student updated successfully',
                'student' => $student->load(['department', 'course', 'academicYear'])
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
                'message' => 'Error updating student: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Student  $student
     * @return \Illuminate\Http\Response
     */
    public function destroy(Student $student)
    {
        $student->delete();
        return redirect()->route('admin.students.index')->with('success', 'Student archived successfully.');
    }

    public function restore($id)
    {
        $student = Student::withTrashed()->findOrFail($id);
        if ($student->trashed()) {
            $student->restore();
            return redirect()->route('admin.settings.index')->with(['success' => 'Student restored.', 'tab' => 'security']);
        }
        return back();
    }

    public function forceDelete($id)
    {
        $student = Student::withTrashed()->findOrFail($id);
        
        // Delete associated user account if exists
        if ($student->user_id) {
            $user = User::find($student->user_id);
            if ($user) {
                $user->delete();
            }
        }
        
        // Permanently delete the student
        $student->forceDelete();
        
        return redirect()->route('admin.settings.index')->with(['success' => 'Student permanently deleted.', 'tab' => 'security']);
    }

    /**
     * API method to get students data for React components
     */
    public function apiIndex()
    {
        $q = request('q');
        $department_filter = request('department_filter');
        $course_filter = request('course_filter');
        
        $students = Student::with(['department', 'course', 'academicYear'])
            ->when($q, function($query) use ($q) {
                $query->where('full_name', 'like', "%$q%");
                $query->orWhere('email', 'like', "%$q%");
            })
            ->when($department_filter, function($query) use ($department_filter) {
                $query->where('department_id', $department_filter);
            })
            ->when($course_filter, function($query) use ($course_filter) {
                $query->where('course_id', $course_filter);
            })
            ->orderBy('full_name')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'students' => $students->items(),
            'pagination' => [
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'per_page' => $students->perPage(),
                'total' => $students->total()
            ]
        ]);
    }

    /**
     * Archive a student
     */
    public function archive(Student $student)
    {
        // Soft delete the student (this will remove them from main list)
        $student->delete();
        return response()->json(['message' => 'Student archived successfully']);
    }
}

