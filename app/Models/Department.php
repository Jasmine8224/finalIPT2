<?php

namespace App\Models;

use App\Models\Course;
use App\Models\Faculty;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['code', 'name', 'description', 'location', 'status'];

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function faculties()
    {
        return $this->hasMany(Faculty::class);
    }
}
