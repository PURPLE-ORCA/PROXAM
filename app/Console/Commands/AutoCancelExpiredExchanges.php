<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Echange;
use App\Models\Notification;
use App\Mail\ExchangeAutoCancelledMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AutoCancelExpiredExchanges extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exchange:auto-cancel-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically cancels expired or soon-to-start exam exchange requests.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired exchange requests...');

        $exchangesToCancel = Echange::whereIn('status', ['Open', 'Pending_Requester_Decision'])
            ->whereHas('offeredAttribution.examen', function ($query) {
                $query->where('debut', '<', Carbon::now()->addHours(24));
            })
            ->with(['offeredAttribution', 'acceptedAttribution', 'requester.user', 'accepter.user'])
            ->get();

        if ($exchangesToCancel->isEmpty()) {
            $this->info('No expired exchange requests found.');
            return self::SUCCESS;
        }

        foreach ($exchangesToCancel as $echange) {
            DB::transaction(function () use ($echange) {
                $echange->update(['status' => 'Cancelled_Auto_Expired']);

                // Clear attribution flags
                if ($echange->offeredAttribution) {
                    $echange->offeredAttribution->update(['is_involved_in_exchange' => false]);
                }
                if ($echange->acceptedAttribution) {
                    $echange->acceptedAttribution->update(['is_involved_in_exchange' => false]);
                }

                // Notify involved professors
                if ($echange->requester && $echange->requester->user) {
                    Notification::create([
                        'user_id' => $echange->requester->user->id,
                        'type' => 'exchange_auto_cancelled',
                        'message' => 'Your exchange request for ' . $echange->offeredAttribution->examen->name . ' has been automatically cancelled.',
                        'link' => route('professeur.exchanges.index', ['tab' => 'exchange-history']),
                        'data' => ['echange_id' => $echange->id],
                    ]);
                    Mail::to($echange->requester->user->email)->send(new ExchangeAutoCancelledMail($echange));
                }

                if ($echange->accepter && $echange->accepter->user) {
                    Notification::create([
                        'user_id' => $echange->accepter->user->id,
                        'type' => 'exchange_auto_cancelled',
                        'message' => 'Your exchange proposal for ' . $echange->offeredAttribution->examen->name . ' has been automatically cancelled.',
                        'link' => route('professeur.exchanges.index', ['tab' => 'exchange-history']),
                        'data' => ['echange_id' => $echange->id],
                    ]);
                    Mail::to($echange->accepter->user->email)->send(new ExchangeAutoCancelledMail($echange));
                }
            });
            $this->info("Exchange #{$echange->id} cancelled due to proximity to exam date.");
        }

        $this->info('Expired exchange requests cancellation complete.');
        return self::SUCCESS;
    }
}
