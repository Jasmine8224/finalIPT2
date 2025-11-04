<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('faculties', function (Blueprint $table) {
            if (!Schema::hasColumn('faculties', 'sex')) {
                $table->string('sex', 16)->nullable()->after('suffix');
            }
            if (!Schema::hasColumn('faculties', 'email')) {
                $table->string('email')->nullable()->after('sex');
            }
            if (!Schema::hasColumn('faculties', 'contact_number')) {
                $table->string('contact_number', 32)->nullable()->after('email');
            }
            if (!Schema::hasColumn('faculties', 'address')) {
                $table->string('address')->nullable()->after('contact_number');
            }
            if (!Schema::hasColumn('faculties', 'position')) {
                $table->string('position')->nullable()->after('address');
            }
            if (!Schema::hasColumn('faculties', 'department_id')) {
                $table->unsignedBigInteger('department_id')->nullable()->after('position');
            }
        });

        // Skip adding foreign key automatically to avoid duplicate key issues across environments.
        // The column will exist; if an FK is desired, it can be added in a separate, explicit migration.
    }

    public function down(): void
    {
        Schema::table('faculties', function (Blueprint $table) {
            if (self::hasForeign('faculties', 'faculties_department_id_foreign')) {
                $table->dropForeign('faculties_department_id_foreign');
            }
            foreach (['sex','email','contact_number','address','position','department_id'] as $col) {
                if (Schema::hasColumn('faculties', $col)) {
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
