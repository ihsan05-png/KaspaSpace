<?php

namespace App\Console\Commands;

use App\Models\BookingHold;
use Illuminate\Console\Command;

class ReleaseExpiredHolds extends Command
{
    protected $signature = 'holds:release-expired';

    protected $description = 'Lepaskan semua booking hold yang sudah melewati 15 menit (expired)';

    public function handle(): void
    {
        $released = BookingHold::releaseExpired();

        if ($released > 0) {
            $this->info("[{$this->timestamp()}] {$released} hold dilepaskan.");
        } else {
            $this->line("[{$this->timestamp()}] Tidak ada hold yang expired.");
        }
    }

    private function timestamp(): string
    {
        return now()->format('Y-m-d H:i:s');
    }
}
