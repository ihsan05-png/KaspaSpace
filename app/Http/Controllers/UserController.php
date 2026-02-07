<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        $guestSubscribers = NewsletterSubscriber::active()->get();

        return Inertia::render('admin/Users/Index', [
            'users' => $users,
            'guestSubscribers' => $guestSubscribers
        ]);
    }

    /**
     * Show the form for creating a new user
     */
    public function create()
    {
        return Inertia::render('admin/Users/Create');
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,user'
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role']
        ]);

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berhasil ditambahkan');
    }

    /**
     * Show the form for editing user
     */
    public function edit(User $user)
    {
        return Inertia::render('admin/Users/Edit', [
            'user' => $user
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:admin,user'
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role']
        ]);

        // Update password only if provided
        if (!empty($validated['password'])) {
            $user->update([
                'password' => Hash::make($validated['password'])
            ]);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berhasil diupdate');
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        // Prevent deleting own account
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'Tidak dapat menghapus akun sendiri']);
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berhasil dihapus');
    }
}
