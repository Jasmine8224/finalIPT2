<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    public function index()
    {
        return redirect()->route('admin.settings.index');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'start_year' => 'required|integer|min:2000|max:2100',
            'end_year' => 'required|integer|min:2000|max:2100|gte:start_year',
            'status' => 'nullable|string|max:24',
        ]);

        AcademicYear::create($data);
        return back()->with('success', 'Academic year added.');
    }

    public function update(Request $request, AcademicYear $academicYear)
    {
        $data = $request->validate([
            'start_year' => 'required|integer|min:2000|max:2100',
            'end_year' => 'required|integer|min:2000|max:2100|gte:start_year',
            'status' => 'nullable|string|max:24',
        ]);
        $academicYear->update($data);
        return back()->with('success', 'Academic year updated.');
    }

    public function destroy(AcademicYear $academicYear)
    {
        $academicYear->delete();
        return back()->with(['success' => 'Academic year archived.', 'tab' => 'security']);
    }

    public function restore($id)
    {
        $year = AcademicYear::withTrashed()->findOrFail($id);
        if ($year->trashed()) {
            $year->restore();
            return back()->with(['success' => 'Academic year restored.', 'tab' => 'security']);
        }
        return back();
    }
}
