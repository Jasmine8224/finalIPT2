<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('faculties', function (Blueprint $table) {
            if (!Schema::hasColumn('faculties', 'suffix')) {
                $table->string('suffix', 10)->nullable()->after('full_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('faculties', function (Blueprint $table) {
            if (Schema::hasColumn('faculties', 'suffix')) {
                $table->dropColumn('suffix');
            }
        });
    }
};
