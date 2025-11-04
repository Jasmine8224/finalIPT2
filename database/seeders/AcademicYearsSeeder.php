<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicYear;

class AcademicYearsSeeder extends Seeder
{
    public function run(): void
    {
        $years = [
            ['start_year' => 2024, 'end_year' => 2025, 'status' => 'active'],
            ['start_year' => 2023, 'end_year' => 2024, 'status' => 'inactive'],
        ];

        foreach ($years as $y) {
            AcademicYear::firstOrCreate(
                ['start_year' => $y['start_year'], 'end_year' => $y['end_year']],
                $y
            );
        }
    }
}
