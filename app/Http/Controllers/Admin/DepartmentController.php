<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $q = request('q');
        $departments = Department::when($q, function($query) use ($q) {
                $query->where('code', 'like', "%$q%");
                $query->orWhere('name', 'like', "%$q%");
            })
            ->orderBy('code')
            ->paginate(10)
            ->withQueryString();

        return view('layouts.admin-react', compact('departments','q'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('layouts.admin-react');
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
            'code' => 'required|string|max:20|unique:departments,code',
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:24',
        ]);

        Department::create($data);

        return redirect()->route('admin.departments.index')->with('success', 'Department created.');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Http\Response
     */
    public function edit(Department $department)
    {
        return view('layouts.admin-react', compact('department'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Department $department)
    {
        $data = $request->validate([
            'code' => 'required|string|max:20|unique:departments,code,' . $department->id,
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:24',
        ]);

        $department->update($data);

        return redirect()->route('admin.departments.index')->with('success', 'Department updated.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Department  $department
     * @return \Illuminate\Http\Response
     */
    public function destroy(Department $department)
    {
        $department->delete();
        return redirect()->route('admin.departments.index')->with('success', 'Department archived successfully.');
    }

    public function restore($id)
    {
        $department = Department::withTrashed()->findOrFail($id);
        if ($department->trashed()) {
            $department->restore();
            return redirect()->route('admin.settings.index')->with(['success' => 'Department restored.', 'tab' => 'security']);
        }
        return back();
    }

    public function forceDelete($id)
    {
        $department = Department::withTrashed()->findOrFail($id);
        
        // Permanently delete the department
        $department->forceDelete();
        
        return redirect()->route('admin.settings.index')->with(['success' => 'Department permanently deleted.', 'tab' => 'security']);
    }

    /**
     * API method to get departments data for React components
     */
    public function apiIndex()
    {
        $q = request('q');
        $departments = Department::when($q, function($query) use ($q) {
                $query->where('code', 'like', "%$q%");
                $query->orWhere('name', 'like', "%$q%");
            })
            ->orderBy('code')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'departments' => $departments->items(),
            'pagination' => [
                'current_page' => $departments->currentPage(),
                'last_page' => $departments->lastPage(),
                'per_page' => $departments->perPage(),
                'total' => $departments->total()
            ]
        ]);
    }

    /**
     * API method to create a new department
     */
    public function apiStore(Request $request)
    {
        try {
            $data = $request->validate([
                'code' => 'required|string|max:20|unique:departments,code',
                'name' => 'required|string|max:200',
                'location' => 'nullable|string|max:200',
                'status' => 'required|in:active,inactive'
            ]);

            $department = Department::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Department created successfully.',
                'department' => $department
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating department: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * API method to update a department
     */
    public function apiUpdate(Request $request, Department $department)
    {
        try {
            $data = $request->validate([
                'code' => 'required|string|max:20|unique:departments,code,' . $department->id,
                'name' => 'required|string|max:200',
                'location' => 'nullable|string|max:200',
                'status' => 'required|in:active,inactive'
            ]);

            $department->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Department updated successfully.',
                'department' => $department
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating department: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Archive (soft delete) a department
     */
    public function archive(Department $department)
    {
        try {
            $department->delete(); // This will soft delete if SoftDeletes trait is used
            
            return response()->json([
                'success' => true,
                'message' => 'Department archived successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error archiving department: ' . $e->getMessage()
            ], 500);
        }
    }
}
