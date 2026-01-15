<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class NewsController extends Controller
{
    /**
     * Display a listing of news for admin
     */
    public function index()
    {
        $news = News::orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('admin/News/Index', [
            'news' => $news,
        ]);
    }

    /**
     * Display a listing of published news for public
     */
    public function publicIndex()
    {
        $news = News::where('is_published', true)
            ->where('type', 'news')
            ->orderBy('published_at', 'desc')
            ->paginate(9);

        return Inertia::render('News/Index', [
            'news' => $news,
        ]);
    }

    /**
     * Display a listing of published blogs for public
     */
    public function publicBlogs()
    {
        $blogs = News::where('is_published', true)
            ->where('type', 'blogs')
            ->orderBy('published_at', 'desc')
            ->paginate(9);

        return Inertia::render('Blogs/Index', [
            'blogs' => $blogs,
        ]);
    }

    /**
     * Display the specified news for public
     */
    public function publicShow($slug)
    {
        $news = News::where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        // Get related news (same category or recent news)
        $relatedNews = News::where('is_published', true)
            ->where('id', '!=', $news->id)
            ->orderBy('published_at', 'desc')
            ->limit(3)
            ->get();

        return Inertia::render('News/Show', [
            'news' => $news,
            'relatedNews' => $relatedNews,
        ]);
    }

    /**
     * Show the form for creating a new news
     */
    public function create()
    {
        return Inertia::render('admin/News/Create');
    }

    /**
     * Store a newly created news in storage
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:news,blogs',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'author' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        // Generate slug
        $validated['slug'] = Str::slug($validated['title']);

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('news', 'public');
        }

        // Set published_at if is_published is true
        if ($validated['is_published'] ?? false) {
            $validated['published_at'] = now();
        }

        News::create($validated);

        return redirect()->route('admin.news.index')->with('success', 'Berita berhasil ditambahkan!');
    }

    /**
     * Show the form for editing the specified news
     */
    public function edit(News $news)
    {
        return Inertia::render('admin/News/Edit', [
            'news' => $news,
        ]);
    }

    /**
     * Update the specified news in storage
     */
    public function update(Request $request, News $news)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:news,blogs',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'author' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        // Update slug if title changed
        if ($validated['title'] !== $news->title) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($news->image) {
                Storage::disk('public')->delete($news->image);
            }
            $validated['image'] = $request->file('image')->store('news', 'public');
        }

        // Set published_at if is_published changed to true
        if (($validated['is_published'] ?? false) && !$news->is_published) {
            $validated['published_at'] = now();
        }

        $news->update($validated);

        return redirect()->route('admin.news.index')->with('success', 'Berita berhasil diperbarui!');
    }

    /**
     * Remove the specified news from storage
     */
    public function destroy(News $news)
    {
        // Delete image
        if ($news->image) {
            Storage::disk('public')->delete($news->image);
        }

        $news->delete();

        return redirect()->route('admin.news.index')->with('success', 'Berita berhasil dihapus!');
    }
}
