<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total_amount',
        'status',        // pending, paid, completed, etc.
        'payment_method',
        'transaction_ref', // Bakong ID
        'delivery_address',
        'note',
        'receipt_image'
    ];

    // Relationship: Who bought this?
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship: What items are in this order?
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
