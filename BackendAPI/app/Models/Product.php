<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'image_url',
        'is_available'
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    /**
     * ✅ THIS IS THE FIX
     * This function runs automatically whenever you use $product->image_url
     */
    public function getImageUrlAttribute($value)
    {
        // 1. If the database is empty, return null (or a default placeholder if you want)
        if (!$value) {
            return null;
        }

        // 2. If it already starts with "http" (like your placeholder links), leave it alone
        if (str_starts_with($value, 'http')) {
            return $value;
        }

        // 3. Otherwise, it's a file path like "products/abc.jpg".
        // We add the domain to make it "http://localhost:8000/storage/products/abc.jpg"
        return asset('storage/' . $value);
    }

    // Relationship: Belongs to a category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relationship: A drink has many sizes (S, M, L)
    public function sizes()
    {
        return $this->hasMany(ProductSize::class);
    }

    // Relationship: A product has many order items
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
