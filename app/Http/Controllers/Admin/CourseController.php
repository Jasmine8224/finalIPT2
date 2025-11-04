<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $q = request('q');
        $courses = Course::with('department')
            ->when($q, function($query) use ($q) {
                $query->where('code', 'like', "%$q%");
                $query->orWhere('title', 'like', "%$q%");
            })
            ->orderBy('code')
            ->paginate(10)
            ->withQueryString();

        return view('layouts.admin-react', compact('courses','q'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $departments = Department::orderBy('name')->pluck('name','id');
        return view('layouts.admin-react', compact('departments'));
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
            'department_id' => 'required|exists:departments,id',
            'code' => 'required|string|max:50|unique:courses,code',
            'title' => 'required|string|max:255',
            'units' => 'nullable|integer|min:1|max:10',
            'status' => 'nullable|string|max:24',
        ]);

        Course::create($data);

        return redirect()->route('admin.courses.index')->with('success', 'Course created.');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\Response
     */
    public function show(Course $course)
    {
        return redirect()->route('admin.courses.edit', $course);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\Response
     */
    public function edit(Course $course)
    {
        $departments = Department::orderBy('name')->pluck('name','id');
        return view('layouts.admin-react', compact('course','departments'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Course $course)
    {
        $data = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'code' => 'required|string|max:50|unique:courses,code,' . $course->id,
            'title' => 'required|string|max:255',
            'units' => 'nullable|integer|min:1|max:10',
            'status' => 'nullable|string|max:24',
        ]);

        $course->update($data);

        return redirect()->route('admin.courses.index')->with('success', 'Course updated.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Course  $course
     * @return \Illuminate\Http\Response
     */
    public function destroy(Course $course)
    {
        $course->delete();
        return redirect()->route('admin.courses.index')->with('success', 'Course archived successfully.');
    }

    public function restore($id)
    {
        $course = Course::withTrashed()->findOrFail($id);
        if ($course->trashed()) {
            $course->restore();
            return redirect()->route('admin.settings.index')->with(['success' => 'Course restored.', 'tab' => 'security']);
        }
        return back();
    }

    public function forceDelete($id)
    {
        $course = Course::withTrashed()->findOrFail($id);
        
        // Permanently delete the course
        $course->forceDelete();
        
        return redirect()->route('admin.settings.index')->with(['success' => 'Course permanently deleted.', 'tab' => 'security']);
    }

    /**
     * Store course via API (for React forms)
     */
    public function apiStore(Request $request)
    {
        try {
            $data = $request->validate([
                'department_id' => 'required|exists:departments,id',
                'code' => 'required|string|max:50|unique:courses,code',
                'title' => 'required|string|max:255',
                'units' => 'required|integer|min:1|max:10',
                'status' => 'nullable|string|max:24',
            ]);

            $course = Course::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Course created successfully',
                'course' => $course->load('department')
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
                'message' => 'Error creating course: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update course via API (for React forms)
     */
    public function apiUpdate(Request $request, Course $course)
    {
        try {
            $data = $request->validate([
                'department_id' => 'required|exists:departments,id',
                'code' => 'required|string|max:50|unique:courses,code,' . $course->id,
                'title' => 'required|string|max:255',
                'units' => 'required|integer|min:1|max:10',
                'status' => 'nullable|string|max:24',
            ]);

            $course->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Course updated successfully',
                'course' => $course->load('department')
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
                'message' => 'Error updating course: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API method to get courses data for React components
     */
    public function apiIndex()
    {
        $q = request('q');
        $courses = Course::with('department')
            ->when($q, function($query) use ($q) {
                $query->where('code', 'like', "%$q%");
                $query->orWhere('title', 'like', "%$q%");
            })
            ->orderBy('code')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'courses' => $courses->items(),
            'pagination' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total()
            ]
        ]);
    }

    /**
     * Archive (soft delete) a course
     */
    public function archive(Course $course)
    {
        try {
            $course->delete(); // This will soft delete if SoftDeletes trait is used
            
            return response()->json([
                'success' => true,
                'message' => 'Course archived successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error archiving course: ' . $e->getMessage()
            ], 500);
        }
    }
}

