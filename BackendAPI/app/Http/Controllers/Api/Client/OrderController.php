<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate incoming data
        $validated = $request->validate([
            'total_amount'       => 'required|numeric',
            'receipt_image'      => 'nullable|image',
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.size_id'    => 'nullable',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.price'      => 'required|numeric',
        ]);

        try {
            DB::beginTransaction();

            // 2. Create the Order
            $order = Order::create([
                'user_id'          => $request->user()->id ?? null,
                'total_amount'     => $validated['total_amount'],
                'status'           => 'pending_payment',
                'payment_method'   => 'bakong_khqr',

                // 👇 THE FIX: Provide default values for required columns
                'delivery_address' => 'Store Pickup',
                'transaction_ref'  => null,
                'note'             => null,
                'receipt_image'    => null, // No longer used in this flow
            ]);

            // 3. Create Order Items
            foreach ($validated['items'] as $itemData) {
                $product = Product::find($itemData['product_id']);

                $sizeName = null;
                // Safe check for size
                if (!empty($itemData['size_id']) && is_numeric($itemData['size_id'])) {
                    $sizeObj = ProductSize::find($itemData['size_id']);
                    $sizeName = $sizeObj ? $sizeObj->size : null;
                }

                OrderItem::create([
                    'order_id'     => $order->id,
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'size' => $item['size'] ?? 'Standard',
                    'price'        => $itemData['price'],
                    'quantity'     => $itemData['quantity'],
                    'options'      => [],
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Order placed successfully!',
                'order_id' => $order->id
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Order Error: " . $e->getMessage());

            // Return exact error to React
            return response()->json([
                'status' => 'error',
                'message' => 'DB Error: ' . $e->getMessage()
            ], 500);
        }
    }
    // Get all orders for the logged-in user
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items') // Eager load the items (coffees) inside the order
            ->orderBy('created_at', 'desc') // Newest first
            ->get();
        return response()->json($orders);
    }

    // GET: Check order status (for frontend polling)
    public function status($id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'order_status' => $order->status
        ]);
    }

    // POST: Webhook from Bank to confirm payment
    public function webhook($id, Request $request)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
        }

        // In a real integration, you would verify the Bakong hash signature here
        $order->update([
            'status' => 'paid',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Payment verified successfully via webhook'
        ]);
    }
}
