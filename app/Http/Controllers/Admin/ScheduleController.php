<?php
// app/Http/Controllers/Admin/ScheduleController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ScheduleController extends Controller
{
    public function index()
    {
        $schedules = Schedule::latest()->get();
        
        return Inertia::render('admin/ScheduleManagement', [
            'schedules' => $schedules,
            'auth' => auth()->user()
        ]);
    }
    
    public function upload(Request $request)
    {
        $request->validate([
            'schedule_data' => 'required|array',
            'schedule_data.*.room' => 'required|string|max:255',
            'schedule_data.*.date' => 'required|string|max:255',
            'schedule_data.*.type' => 'required|string|max:255',
            'schedule_data.*.sub_type' => 'nullable|string|max:255',
            'schedule_data.*.occupancy' => 'required|string|max:255',
            'schedule_data.*.inv' => 'nullable|string|max:255',
            'schedule_data.*.check_in' => 'nullable|string|max:255',
            'schedule_data.*.check_out' => 'nullable|string|max:255',
        ]);

        try {
            // Clear existing data
            Schedule::truncate();
            
            // Insert new data in batches for better performance
            $scheduleData = collect($request->schedule_data)->map(function ($item) {
                return [
                    'room' => $item['room'],
                    'date' => $item['date'],
                    'type' => $item['type'],
                    'sub_type' => $item['sub_type'] ?? '',
                    'occupancy' => $item['occupancy'],
                    'inv' => $item['inv'] ?? '',
                    'check_in' => $item['check_in'] ?? '',
                    'check_out' => $item['check_out'] ?? '',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            });

            // Insert in chunks to avoid memory issues
            $scheduleData->chunk(500)->each(function ($chunk) {
                Schedule::insert($chunk->toArray());
            });

            return redirect()->back()->with('success', 
                'Schedule data uploaded successfully! ' . count($request->schedule_data) . ' records added.'
            );
            
        } catch (\Exception $e) {
            \Log::error('Schedule upload error: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 
                'Failed to upload schedule data. Please try again.'
            );
        }
    }
    
    public function clear()
    {
        try {
            $count = Schedule::count();
            Schedule::truncate();
            
            return redirect()->back()->with('success', 
                "Successfully deleted {$count} schedule records."
            );
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 
                'Failed to clear schedule data.'
            );
        }
    }
    
    public function view()
    {
        $schedules = Schedule::latest()->paginate(50);
        
        return Inertia::render('admin/ScheduleView', [
            'schedules' => $schedules
        ]);
    }
    
    public function parseExcel(Request $request)
    {
        $request->validate([
            'excel_file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);

        try {
            $file = $request->file('excel_file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray(null, true, true, false);

            if (empty($rows)) {
                return response()->json(['error' => 'File Excel kosong.'], 422);
            }

            // Baris pertama sebagai header
            $headers = array_map('trim', $rows[0]);
            $data = [];

            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];

                // Skip baris kosong
                if (empty(array_filter($row))) continue;

                $map = array_combine($headers, $row);

                $data[] = [
                    'id'        => $i,
                    'room'      => $map['ROOM'] ?? $map['Room'] ?? '',
                    'date'      => $map['DATE'] ?? $map['Date'] ?? '',
                    'type'      => $map['TYPE'] ?? $map['Type'] ?? '',
                    'sub_type'  => $map['SUB TYPE'] ?? $map['Sub Type'] ?? $map['subType'] ?? '',
                    'occupancy' => $map['OCCUPANCY'] ?? $map['Occupancy'] ?? '',
                    'inv'       => $map['INV'] ?? $map['Inv'] ?? '',
                    'check_in'  => $map['CHECK-IN'] ?? $map['Check In'] ?? $map['checkIn'] ?? '',
                    'check_out' => $map['CHECK-OUT'] ?? $map['Check Out'] ?? $map['checkOut'] ?? '',
                ];
            }

            return response()->json(['data' => $data, 'total' => count($data)]);

        } catch (\Exception $e) {
            \Log::error('Parse Excel error: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal membaca file Excel. Pastikan format file valid.'], 422);
        }
    }

    // API endpoint for frontend real-time data
    public function getPublicData()
    {
        $schedules = Schedule::latest()->get();
        
        return response()->json([
            'scheduleData' => $schedules->map(function ($schedule) {
                return [
                    'room' => $schedule->room,
                    'date' => $schedule->date,
                    'type' => $schedule->type,
                    'subType' => $schedule->sub_type,
                    'occupancy' => $schedule->occupancy,
                    'inv' => $schedule->inv,
                    'checkIn' => $schedule->check_in,
                    'checkOut' => $schedule->check_out,
                ];
            }),
            'lastUpdated' => $schedules->max('updated_at'),
            'total' => $schedules->count()
        ]);
    }
}