<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateStudentsTableToMatchErd extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            // Add full_name column
            $table->string('full_name')->after('user_id');
            
            // Remove old columns that don't match ERD
            $table->dropColumn(['student_no', 'first_name', 'last_name', 'dob', 'gender', 'year_level']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            // Restore old columns
            $table->string('student_no')->unique()->after('user_id');
            $table->string('first_name')->after('student_no');
            $table->string('last_name')->after('first_name');
            $table->date('dob')->nullable()->after('last_name');
            $table->string('gender', 16)->nullable()->after('dob');
            $table->unsignedTinyInteger('year_level')->nullable()->after('academic_year_id');
            
            // Remove full_name
            $table->dropColumn('full_name');
        });
    }
}
