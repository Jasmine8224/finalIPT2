<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateFacultiesTableToMatchErd extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('faculties', function (Blueprint $table) {
            // Add full_name column
            $table->string('full_name')->after('user_id');
            
            // Remove old columns that don't match ERD
            $table->dropColumn(['employee_no', 'first_name', 'last_name', 'title']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('faculties', function (Blueprint $table) {
            // Restore old columns
            $table->string('employee_no')->unique()->after('user_id');
            $table->string('first_name')->after('employee_no');
            $table->string('last_name')->after('first_name');
            $table->string('title')->nullable()->after('address');
            
            // Remove full_name
            $table->dropColumn('full_name');
        });
    }
}
