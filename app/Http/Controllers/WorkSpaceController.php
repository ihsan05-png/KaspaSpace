<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Inertia\Inertia;

class WorkspaceController extends Controller
{
    public function index($categorySlug = 'coworking-space')
    {
        // Cari kategori berdasarkan slug
        $category = Category::where('slug', $categorySlug)
            ->select('id', 'name', 'slug')
            ->first();
        
        if (!$category) {
            return Inertia::render('WorkSpaceSection', [
                'products' => [],
                'currentCategory' => null,
                'categories' => Category::select('id', 'name', 'slug')->get()
            ]);
        }
        
        $products = Product::with(['category:id,name,slug', 'variants'])
            ->where('category_id', $category->id)
            ->where('is_active', true)
            ->select('id', 'title', 'slug', 'subtitle', 'description', 'promo_label', 'base_price', 'images', 'is_featured', 'custom_options', 'category_id')
            ->get();
        
        return Inertia::render('WorkSpaceSection', [
            'products' => $products,
            'currentCategory' => $category,
            'categories' => Category::select('id', 'name', 'slug')->get()
        ]);
    }
}
