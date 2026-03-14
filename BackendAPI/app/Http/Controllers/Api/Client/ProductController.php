<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/products
    // Supports: /api/products?category=coffee-series
    public function index(Request $request)
    {
        $query = Product::query();

        // 1. PERFORMANCE: Always load the Prices (sizes) and Category info
        $query->with(['sizes', 'category']);

        // 2. LOGIC: Only show available products
        $query->where('is_available', true);

        // 3. FILTER: If URL has ?category=coffee-series
        if ($request->has('category')) {
            $slug = $request->query('category');
            $query->whereHas('category', function($q) use ($slug) {
                $q->where('slug', $slug);
            });
        }

        // 4. SEARCH: If URL has ?search=latte
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where('name', 'LIKE', "%{$search}%");
        }

        // 5. SORT: Top sellers
        if ($request->query('sort') === 'top_sellers') {
            $query->withSum('orderItems', 'quantity')
                  ->orderByDesc('order_items_sum_quantity');
        }

        // 6. LIMIT
        if ($request->has('limit')) {
            $query->limit($request->query('limit'));
        }

        $products = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $products
        ], 200);
    }

    // GET /api/products/{id}
    public function show($id)
    {
        $product = Product::with(['sizes', 'category'])
            ->where('is_available', true)
            ->find($id);

        if ($product) {
            return response()->json([
                'status' => 'success',
                'data' => $product
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Product not found'
        ], 404);
    }
}
