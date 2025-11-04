<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Department;

class CoursesSeeder extends Seeder
{
    public function run(): void
    {
        $deptIds = Department::pluck('id','code');

        $courses = [
            ['department' => 'CS', 'code' => 'CS101', 'title' => 'Intro to Programming', 'units' => 3, 'status' => 'active'],
            ['department' => 'CS', 'code' => 'CS201', 'title' => 'Data Structures', 'units' => 3, 'status' => 'active'],
            ['department' => 'ENG', 'code' => 'ENG101', 'title' => 'Engineering Basics', 'units' => 3, 'status' => 'active'],
            ['department' => 'BUS', 'code' => 'BUS101', 'title' => 'Principles of Management', 'units' => 3, 'status' => 'active'],
        ];

        foreach ($courses as $c) {
            $depId = $deptIds[$c['department']] ?? null;
            if ($depId) {
                Course::firstOrCreate(
                    ['code' => $c['code']],
                    [
                        'department_id' => $depId,
                        'title' => $c['title'],
                        'units' => $c['units'],
                        'status' => $c['status'],
                    ]
                );
            }
        }
    }
}
