<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentsSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['code' => 'CS', 'name' => 'Computer Science', 'location' => 'Building A', 'status' => 'active'],
            ['code' => 'ENG', 'name' => 'Engineering', 'location' => 'Building B', 'status' => 'active'],
            ['code' => 'BUS', 'name' => 'Business Administration', 'location' => 'Building C', 'status' => 'active'],
        ];

        foreach ($items as $d) {
            Department::firstOrCreate(['code' => $d['code']], $d);
        }
    }
}
