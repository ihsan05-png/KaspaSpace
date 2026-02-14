<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agreement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgreementController extends Controller
{
    public function index()
    {
        $agreements = Agreement::all();

        return Inertia::render('admin/Agreements/Index', [
            'agreements' => $agreements,
        ]);
    }

    public function edit(Agreement $agreement)
    {
        return Inertia::render('admin/Agreements/Edit', [
            'agreement' => $agreement,
        ]);
    }

    public function update(Request $request, Agreement $agreement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|array|min:1',
            'content.*.title' => 'required|string|max:255',
            'content.*.items' => 'required|array|min:1',
            'content.*.items.*' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $agreement->update($validated);

        return redirect()->route('admin.agreements.index')
            ->with('success', 'Agreement berhasil diperbarui.');
    }
}
