<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'sizes'])->latest()->get();
        return response()->json(['status' => 'success', 'data' => $products]);
    }

    // POST /api/admin/products
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id'  => 'nullable|integer',
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'is_available' => 'boolean',
            'image'        => 'nullable|image|max:4096',
            'sizes'        => 'required|array|min:1',
            'sizes.*.size' => 'required|string',
            'sizes.*.price'=> 'required|numeric|min:0',
        ]);

        // Auto-create a default category if none exists or category_id not provided
        $category = Category::firstOrCreate(
            ['name' => 'General'],
            ['description' => 'Default category']
        );
        $categoryId = $validated['category_id'] ?? $category->id;

        // 1. Handle Image Upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = DB::transaction(function () use ($validated, $imagePath, $categoryId) {
            $product = Product::create([
                'category_id'  => $categoryId,
                'name'         => $validated['name'],
                'description'  => $validated['description'] ?? null,
                'image_url'    => $imagePath,
                'is_available' => $validated['is_available'] ?? true,
            ]);

            foreach ($validated['sizes'] as $sizeData) {
                $product->sizes()->create([
                    'size'  => $sizeData['size'],
                    'price' => $sizeData['price']
                ]);
            }
            return $product;
        });

        return response()->json(['status' => 'success', 'data' => $product->load('sizes')], 201);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'sizes'])->findOrFail($id);
        return response()->json(['status' => 'success', 'data' => $product]);
    }

    // PUT /api/admin/products/{id}
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id'  => 'exists:categories,id',
            'name'         => 'string|max:255',
            'description'  => 'nullable|string',
            'is_available' => 'boolean',
            'image'        => 'nullable|image|max:2048', // Validate as IMAGE file
            'sizes'        => 'array',
            'sizes.*.size' => 'required_with:sizes|string',
            'sizes.*.price'=> 'required_with:sizes|numeric',
        ]);

        DB::transaction(function () use ($product, $validated, $request) {

            // 1. Check if new image is uploaded
            if ($request->hasFile('image')) {
                // (Optional) Delete old image
                if ($product->image_url && Storage::disk('public')->exists($product->image_url)) {
                    Storage::disk('public')->delete($product->image_url);
                }

                // Store new image
                $path = $request->file('image')->store('products', 'public');
                $product->image_url = $path; // Update model
            }

            // 2. Update other fields
            $product->update([
                'category_id'  => $validated['category_id'] ?? $product->category_id,
                'name'         => $validated['name'] ?? $product->name,
                'description'  => $validated['description'] ?? $product->description,
                'is_available' => $validated['is_available'] ?? $product->is_available,
                // Do NOT overwrite image_url here, we handled it manually above
            ]);

            // 3. Update sizes if present
            if (isset($validated['sizes'])) {
                $product->sizes()->delete();
                foreach ($validated['sizes'] as $sizeData) {
                    $product->sizes()->create([
                        'size'  => $sizeData['size'],
                        'price' => $sizeData['price']
                    ]);
                }
            }
        });
        return response()->json([
            'status' => 'success',
            'message' => 'Product updated successfully',
            'data' => $product->fresh(['sizes'])
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->image_url && Storage::disk('public')->exists($product->image_url)) {
            Storage::disk('public')->delete($product->image_url);
        }
        $product->sizes()->delete();
        $product->delete();
        return response()->json(['status' => 'success', 'message' => 'Product deleted successfully']);
    }
}
