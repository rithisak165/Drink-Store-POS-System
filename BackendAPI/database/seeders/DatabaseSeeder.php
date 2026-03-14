<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create the admin user
        User::firstOrCreate(
            ['email' => 'admin@drinkshop.com'],
            [
                'name'      => 'Admin',
                'email'     => 'admin@drinkshop.com',
                'password'  => Hash::make('Admin@1234'),
                'role'      => 'admin',
                'is_active' => true,
            ]
        );
    }
}
