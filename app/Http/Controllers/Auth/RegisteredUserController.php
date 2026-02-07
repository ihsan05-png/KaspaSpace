<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'required|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'terms' => 'accepted',
            'privacy' => 'accepted',
            'newsletter' => 'accepted',
        ], [
            'terms.accepted' => 'Anda harus menyetujui Syarat & Ketentuan.',
            'privacy.accepted' => 'Anda harus menyetujui Kebijakan Privasi.',
            'newsletter.accepted' => 'Anda harus menyetujui berlangganan newsletter.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'agreed_terms' => $request->terms ? true : false,
            'agreed_privacy' => $request->privacy ? true : false,
            'agreed_newsletter' => $request->newsletter ? true : false,
            'agreed_at' => now(),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect('/');  // Redirect ke halaman utama setelah registrasi
    }
}
