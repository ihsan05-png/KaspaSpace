<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NewsletterController extends Controller
{
    /**
     * Send newsletter to all subscribers
     */
    public function send(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'attachment' => 'nullable|file|mimes:pdf,png,jpg,jpeg,gif,webp,doc,docx,xls,xlsx|max:10240' // Max 10MB
        ]);

        // Get registered users who subscribed to newsletter
        $registeredSubscribers = User::where('agreed_newsletter', true)
            ->get(['name', 'email'])
            ->map(function ($user) {
                return [
                    'name' => $user->name,
                    'email' => $user->email,
                    'source' => 'registered'
                ];
            });

        // Get guest subscribers
        $guestSubscribers = NewsletterSubscriber::active()
            ->get(['name', 'email'])
            ->map(function ($sub) {
                return [
                    'name' => $sub->name,
                    'email' => $sub->email,
                    'source' => 'guest'
                ];
            });

        // Merge and remove duplicates by email
        $allSubscribers = $registeredSubscribers->concat($guestSubscribers)
            ->unique('email')
            ->values();

        $subscribers = $allSubscribers;

        if ($subscribers->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada subscriber newsletter'
            ], 400);
        }

        // Handle file attachment
        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('newsletters', 'public');
        }

        $successCount = 0;
        $failCount = 0;

        $logoPath = public_path('images/kaspa-space-logo.png');

        foreach ($subscribers as $subscriber) {
            try {
                Mail::send([], [], function ($mail) use ($request, $subscriber, $attachmentPath, $logoPath) {
                    $mail->to($subscriber['email'], $subscriber['name'])
                        ->subject($request->subject)
                        ->html($this->buildEmailHtml($request->message, $subscriber['name']));

                    // Embed logo as inline CID attachment
                    if (file_exists($logoPath)) {
                        $mail->getSymfonyMessage()->embedFromPath($logoPath, 'logo', 'image/png');
                    }

                    // Attach file if exists
                    if ($attachmentPath) {
                        $mail->attach(storage_path('app/public/' . $attachmentPath));
                    }
                });
                $successCount++;
            } catch (\Exception $e) {
                $failCount++;
                \Log::error('Failed to send newsletter to ' . $subscriber['email'], [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        // Clean up uploaded file after sending
        if ($attachmentPath) {
            \Storage::disk('public')->delete($attachmentPath);
        }

        return response()->json([
            'success' => true,
            'message' => "Newsletter berhasil dikirim ke {$successCount} subscriber" . ($failCount > 0 ? " ({$failCount} gagal)" : "")
        ]);
    }

    /**
     * Unsubscribe/delete a guest subscriber
     */
    public function unsubscribe(NewsletterSubscriber $subscriber)
    {
        $subscriber->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Subscriber berhasil dihapus dari newsletter');
    }

    /**
     * Build HTML email content
     */
    private function buildEmailHtml($message, $recipientName)
    {
        $appName = config('app.name', 'Kaspa Space');
        $year = date('Y');

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        </head>
        <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f0f7ff;'>
            <div style='background-color: #f0f7ff; padding: 30px 20px;'>

                <!-- Content Card -->
                <div style='background: #ffffff; border-radius: 12px; border: 1px solid #d6e8f7; overflow: hidden;'>
                    <!-- Logo -->
                    <div style='text-align: center; padding: 30px 30px 20px;'>
                        <img src='cid:logo' alt='{$appName}' style='height: 50px;' />
                    </div>
                    <!-- Blue accent line -->
                    <div style='height: 3px; background: linear-gradient(90deg, #0a7ec2, #42c6ff);'></div>
                    <!-- Body -->
                    <div style='padding: 30px 30px 35px;'>
                        <p style='font-size: 16px; color: #1a3a5c; margin: 0 0 20px;'>Halo <strong>{$recipientName}</strong>,</p>

                        <div style='font-size: 15px; color: #333; line-height: 1.7;'>
                            " . nl2br(htmlspecialchars($message)) . "
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style='text-align: center; padding: 25px 20px 10px;'>
                    <p style='margin: 0 0 5px; color: #7a9cc6; font-size: 12px;'>
                        Email ini dikirim karena Anda berlangganan newsletter {$appName}.
                    </p>
                    <p style='margin: 0; color: #a0b8d0; font-size: 11px;'>
                        &copy; {$year} {$appName}. All rights reserved.
                    </p>
                </div>

            </div>
        </body>
        </html>
        ";
    }
}
