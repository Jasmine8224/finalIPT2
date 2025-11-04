<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'sex')) {
                $table->string('sex', 16)->nullable()->after('suffix');
            }
            if (!Schema::hasColumn('students', 'birthdate')) {
                $table->date('birthdate')->nullable()->after('sex');
            }
            if (!Schema::hasColumn('students', 'email')) {
                $table->string('email')->nullable()->after('birthdate');
            }
            if (!Schema::hasColumn('students', 'contact_number')) {
                $table->string('contact_number', 32)->nullable()->after('email');
            }
            if (!Schema::hasColumn('students', 'address')) {
                $table->string('address')->nullable()->after('contact_number');
            }
            if (!Schema::hasColumn('students', 'course_id')) {
                $table->unsignedBigInteger('course_id')->nullable()->after('address');
            }
            if (!Schema::hasColumn('students', 'academic_year_id')) {
                $table->unsignedBigInteger('academic_year_id')->nullable()->after('department_id');
            }
        });

        // Add foreign keys separately to avoid issues if columns already exist without FKs
        Schema::table('students', function (Blueprint $table) {
            if (Schema::hasColumn('students', 'course_id') && !self::hasForeign('students', 'students_course_id_foreign')) {
                $table->foreign('course_id')->references('id')->on('courses')->nullOnDelete();
            }
            if (Schema::hasColumn('students', 'academic_year_id') && !self::hasForeign('students', 'students_academic_year_id_foreign')) {
                $table->foreign('academic_year_id')->references('id')->on('academic_years')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (self::hasForeign('students', 'students_course_id_foreign')) {
                $table->dropForeign('students_course_id_foreign');
            }
            if (self::hasForeign('students', 'students_academic_year_id_foreign')) {
                $table->dropForeign('students_academic_year_id_foreign');
            }
            foreach (['sex','birthdate','email','contact_number','address','course_id','academic_year_id'] as $col) {
                if (Schema::hasColumn('students', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }

    private static function hasForeign(string $table, string $index): bool
    {
        try {
            \DB::connection()->getDoctrineSchemaManager();
        } catch (\Throwable $e) {
            return false;
        }
        $sm = Schema::getConnection()->getDoctrineSchemaManager();
        $doctrineTable = $sm->listTableDetails($table);
        return $doctrineTable->hasForeignKey($index);
    }
};
