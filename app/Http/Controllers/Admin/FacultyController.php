<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\Department;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class FacultyController extends Controller
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
        
        $faculties = Faculty::with('department')
            ->when($q, function($query) use ($q) {
                $query->where('full_name', 'like', "%$q%");
                $query->orWhere('email', 'like', "%$q%");
            })
            ->when($department_filter, function($query) use ($department_filter) {
                $query->where('department_id', $department_filter);
            })
            ->orderBy('full_name')
            ->paginate(10)
            ->withQueryString();

        // Get filter options
        $departments = Department::orderBy('name')->pluck('name', 'id');

        return view('layouts.admin-react', compact('faculties', 'q', 'departments', 'department_filter'));
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
            'full_name'   => 'required|string|max:200',
            'suffix'      => 'nullable|string|max:20',
            'sex'         => 'required|string|max:16',
            'email'       => 'required|email|max:255|unique:users,email',
            'contact_number' => 'nullable|string|max:50',
            'address'     => 'nullable|string',
            'position'    => 'nullable|string|max:100',
            'department_id' => 'nullable|exists:departments,id',
            'status'      => 'nullable|string|max:24',
        ]);

        // Create linked user and attach faculty role
        $user = User::create([
            'name' => $data['full_name'],
            'email' => $data['email'],
            'password' => Hash::make('password'),
        ]);
        if ($user) {
            if ($role = Role::where('name', 'faculty')->first()) {
                $user->roles()->syncWithoutDetaching([$role->id]);
            }
            $data['user_id'] = $user->id;
        }

        Faculty::create($data);

        return redirect()->route('admin.faculties.index')->with('success', 'Faculty created.');
    }

    /**
     * Store faculty via API (for React forms)
     */
    public function apiStore(Request $request)
    {
        try {
            $data = $request->validate([
                'full_name'   => 'required|string|max:200',
                'suffix'      => 'nullable|string|max:20',
                'sex'         => 'required|string|max:16',
                'email'       => 'required|email|max:255|unique:users,email',
                'contact_number' => 'nullable|string|max:50',
                'address'     => 'nullable|string',
                'position'    => 'nullable|string|max:100',
                'department_id' => 'nullable|exists:departments,id',
                'status'      => 'nullable|string|max:24',
            ]);

            // Create linked user and attach faculty role
            $user = User::create([
                'name' => $data['full_name'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
            ]);
            if ($user) {
                if ($role = Role::where('name', 'faculty')->first()) {
                    $user->roles()->syncWithoutDetaching([$role->id]);
                }
                $data['user_id'] = $user->id;
            }

            $faculty = Faculty::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Faculty created successfully',
                'faculty' => $faculty->load('department')
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
                'message' => 'Error creating faculty: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Faculty  $faculty
     * @return \Illuminate\Http\Response
     */
    public function show(Faculty $faculty)
    {
        return redirect()->route('admin.faculties.edit', $faculty);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Faculty  $faculty
     * @return \Illuminate\Http\Response
     */
    public function edit(Faculty $faculty)
    {
        $departments = Department::orderBy('name')->pluck('name','id');
        return view('layouts.admin-react', compact('faculty','departments'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Faculty  $faculty
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Faculty $faculty)
    {
        $data = $request->validate([
            'full_name'   => 'required|string|max:200',
            'suffix'      => 'nullable|string|max:20',
            'sex'         => 'required|string|max:16',
            'email'       => 'required|email|max:255|unique:users,email,' . ($faculty->user_id ?? 'NULL'),
            'contact_number' => 'nullable|string|max:50',
            'address'     => 'nullable|string',
            'position'    => 'nullable|string|max:100',
            'department_id' => 'nullable|exists:departments,id',
            'status'      => 'nullable|string|max:24',
        ]);

        // Ensure linked user exists and is updated
        if ($faculty->user_id) {
            $user = User::find($faculty->user_id);
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
            if ($role = Role::where('name', 'faculty')->first()) {
                $user->roles()->syncWithoutDetaching([$role->id]);
            }
            $data['user_id'] = $user->id;
        }

        $faculty->update($data);

        return redirect()->route('admin.faculties.index')->with('success', 'Faculty updated.');
    }

    /**
     * Update faculty via API (for React forms)
     */
    public function apiUpdate(Request $request, Faculty $faculty)
    {
        try {
            $data = $request->validate([
                'full_name'   => 'required|string|max:200',
                'suffix'      => 'nullable|string|max:20',
                'sex'         => 'required|string|max:16',
                'email'       => 'required|email|max:255|unique:users,email,' . ($faculty->user_id ?? 'NULL'),
                'contact_number' => 'nullable|string|max:50',
                'address'     => 'nullable|string',
                'position'    => 'nullable|string|max:100',
                'department_id' => 'nullable|exists:departments,id',
                'status'      => 'nullable|string|max:24',
            ]);

            // Ensure linked user exists and is updated
            if ($faculty->user_id) {
                $user = User::find($faculty->user_id);
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
                if ($role = Role::where('name', 'faculty')->first()) {
                    $user->roles()->syncWithoutDetaching([$role->id]);
                }
                $data['user_id'] = $user->id;
            }

            $faculty->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Faculty updated successfully',
                'faculty' => $faculty->load('department')
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
                'message' => 'Error updating faculty: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Faculty  $faculty
     * @return \Illuminate\Http\Response
     */
    public function destroy(Faculty $faculty)
    {
        $faculty->delete();
        return redirect()->route('admin.faculties.index')->with('success', 'Faculty archived successfully.');
    }

    public function restore($id)
    {
        $faculty = Faculty::withTrashed()->findOrFail($id);
        if ($faculty->trashed()) {
            $faculty->restore();
            return redirect()->route('admin.settings.index')->with(['success' => 'Faculty restored.', 'tab' => 'security']);
        }
        return back();
    }

    public function forceDelete($id)
    {
        $faculty = Faculty::withTrashed()->findOrFail($id);
        
        // Delete associated user account if exists
        if ($faculty->user_id) {
            $user = User::find($faculty->user_id);
            if ($user) {
                $user->delete();
            }
        }
        
        // Permanently delete the faculty
        $faculty->forceDelete();
        
        return redirect()->route('admin.settings.index')->with(['success' => 'Faculty permanently deleted.', 'tab' => 'security']);
    }

    /**
     * API method to get faculties data for React components
     */
    public function apiIndex()
    {
        $q = request('q');
        $department_filter = request('department_filter');
        
        $faculties = Faculty::with('department')
            ->when($q, function($query) use ($q) {
                $query->where('full_name', 'like', "%$q%");
                $query->orWhere('email', 'like', "%$q%");
            })
            ->when($department_filter, function($query) use ($department_filter) {
                $query->where('department_id', $department_filter);
            })
            ->orderBy('full_name')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'faculties' => $faculties->items(),
            'pagination' => [
                'current_page' => $faculties->currentPage(),
                'last_page' => $faculties->lastPage(),
                'per_page' => $faculties->perPage(),
                'total' => $faculties->total()
            ]
        ]);
    }

    /**
     * Archive a faculty
     */
    public function archive(Faculty $faculty)
    {
        // Soft delete the faculty (this will remove them from main list)
        $faculty->delete();
        return response()->json(['message' => 'Faculty archived successfully']);
    }
}

