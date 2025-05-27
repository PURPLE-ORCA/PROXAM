<?php

namespace App\Http\Controllers\Professor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Echange;
use App\Models\Attribution;
use App\Models\Professeur;
use App\Services\ConstraintCheckingService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Notification; // Assuming Notification model exists
use App\Mail\ExchangeProposalReceivedMail;
use App\Mail\ExchangeProposalWithdrawnMail;
use App\Mail\ExchangeOutcomeMail;
use App\Mail\ExchangeAutoCancelledMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ExchangeController extends Controller
{
    protected $constraintCheckingService;

    public function __construct(ConstraintCheckingService $constraintCheckingService)
    {
        $this->constraintCheckingService = $constraintCheckingService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $professeur = $user->professeur;
        $selectedAnneeUniId = session('selected_annee_uni_id'); // Get selected academic year

        if (!$professeur) {
            // Consider redirecting to a more appropriate page or showing a generic error
            // For now, let's ensure we return an Inertia response with empty arrays if possible
            // to prevent frontend errors, though redirect is probably better.
             return Inertia::render('Professor/ExchangesPage', [
                'exchangeMarket' => collect(),
                'myOpenRequests' => collect(),
                'myProposals' => collect(),
                'exchangeHistory' => collect(),
                'myAttributions' => collect(), // Send empty if professor not found
                // You might want a specific error message prop here too
            ]);
        }
        
        if (!$selectedAnneeUniId) {
            // Handle case where no academic year is selected
            // (e.g. from your HandleInertiaRequests, there should always be a default)
            // For now, assume it's always set. Add logging if it can be null.
            Log::warning("ExchangeController@index: selectedAnneeUniId is not set in session.");
        }


        // Fetch data for each tab, filtering by selectedAnneeUniId where appropriate
        $exchangeMarket = Echange::where('status', 'Open')
            ->where('professeur_requester_id', '!=', $professeur->id)
            ->whereHas('offeredAttribution.examen.seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId)) // Filter by year
            ->with(['offeredAttribution.examen.module', 'requester.user']) // Add module for display
            ->get();

        $myOpenRequests = Echange::where('professeur_requester_id', $professeur->id)
            ->whereIn('status', ['Open', 'Pending_Requester_Decision'])
            ->whereHas('offeredAttribution.examen.seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId)) // Filter by year
            ->with(['offeredAttribution.examen.module', 'accepter.user', 'acceptedAttribution.examen.module'])
            ->get();

        $myProposals = Echange::where('professeur_accepter_id', $professeur->id)
            ->where('status', 'Pending_Requester_Decision') // Only show active proposals they made
            ->whereHas('offeredAttribution.examen.seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId)) // Filter by year
            ->with(['offeredAttribution.examen.module', 'requester.user', 'acceptedAttribution.examen.module'])
            ->get();

        $exchangeHistory = Echange::where(function ($query) use ($professeur) {
                $query->where('professeur_requester_id', $professeur->id)
                      ->orWhere('professeur_accepter_id', $professeur->id);
            })
            ->whereIn('status', ['Approved', 'Refused_By_Requester', 'Cancelled_By_Admin', 'Cancelled_Auto_Expired', 'Withdrawn_By_Proposer', 'Cancelled_By_Requester']) // Ensure all terminal statuses
            ->whereHas('offeredAttribution.examen.seson', fn($q) => $q->where('annee_uni_id', $selectedAnneeUniId)) // Filter by year
            ->with(['offeredAttribution.examen.module', 'requester.user', 'accepter.user', 'acceptedAttribution.examen.module'])
            ->orderBy('updated_at', 'desc') // Show most recent history first
            ->get();

        // Fetch the professor's own attributions they can offer for exchange
        // These should be future assignments, not already involved in an exchange,
        // and within the selected academic year.
        $myAttributions = Attribution::where('professeur_id', $professeur->id)
            ->where('is_involved_in_exchange', false) // Only those not already in a process
            ->whereHas('examen', function($queryExamen) use ($selectedAnneeUniId) {
                $queryExamen->where('debut', '>=', now()) // Future exams
                            ->whereHas('seson', fn($qSeson) => $qSeson->where('annee_uni_id', $selectedAnneeUniId));
            })
            ->with('examen.module') // Eager load for display in the select dropdown
            ->join('examens', 'attributions.examen_id', '=', 'examens.id')
            ->select('attributions.*')
            ->orderBy('examens.debut', 'asc') // Join needed if sorting by examen.debut directly
            ->get();


        return Inertia::render('Professor/ExchangesPage', [
            'exchangeMarket' => $exchangeMarket,
            'myOpenRequests' => $myOpenRequests,
            'myProposals' => $myProposals,
            'exchangeHistory' => $exchangeHistory,
            'myAttributions' => $myAttributions, // <<<< ADD THIS PROP
        ]);
    }

    public function storeRequest(Request $request)
    {
        $request->validate([
            'attribution_id' => 'required|exists:attributions,id',
            'motif' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $professeur = $user->professeur;

        if (!$professeur) {
            return back()->with('error', 'Professor profile not found.');
        }

        $attribution = Attribution::find($request->attribution_id);

        if (!$attribution) {
            return back()->with('error', 'Attribution not found.');
        }

        // Defensive check: Ensure it's a single model, not a collection
        if ($attribution instanceof \Illuminate\Database\Eloquent\Collection) {
            $attribution = $attribution->first();
        }
        if (!$attribution) { // Re-check if first() returned null from an empty collection
            return back()->with('error', 'Attribution not found after collection resolution.');
        }

        // Check if the attribution is exchangeable
        if (!$this->constraintCheckingService->isAttributionExchangeable($attribution, $professeur)) {
            return back()->with('error', 'This assignment cannot be offered for exchange.');
        }

        // Prevent offering an attribution already involved in an open exchange
        if ($attribution->is_involved_in_exchange) {
            return back()->with('error', 'This assignment is already involved in an active exchange process.');
        }

        DB::transaction(function () use ($professeur, $attribution, $request) {
            Echange::create([
                'attribution_offered_id' => $attribution->id,
                'professeur_requester_id' => $professeur->id,
                'motif' => $request->motif,
                'status' => 'Open',
            ]);

            $attribution->update(['is_involved_in_exchange' => true]);
        });

        return back()->with('success', 'Exchange request created successfully.');
    }

    public function getSwappableAssignments(Echange $echange)
    {
        Log::info("--- getSwappableAssignments ---");
        Log::info("Echange ID: " . $echange->id);

        $user = Auth::user();
        $professeur = $user->professeur;

        if (!$professeur) {
            Log::error("Professor profile not found for user ID: " . $user->id);
            return response()->json(['error' => 'Professor profile not found.'], 404);
        }
        Log::info("Current Professor ID: " . $professeur->id);

        $offeredAttribution = $echange->loadMissing('offeredAttribution.examen')->offeredAttribution; // Eager load

        if (!$offeredAttribution) {
            Log::error("OfferedAttribution not found for Echange ID: {$echange->id}");
            return response()->json(['error' => 'Details of the offered assignment are missing.'], 500);
        }
        Log::info("Offered Attribution ID: " . $offeredAttribution->id);

        $offeredExamen = $offeredAttribution->examen;
        if (!$offeredExamen || !$offeredExamen->debut) { // Check debut specifically
            Log::error("Exam details or debut time missing for Offered Attribution ID: {$offeredAttribution->id}");
            return response()->json(['error' => 'Exam details for the offered assignment are incomplete.'], 500);
        }
        Log::info("Offered Examen ID: " . $offeredExamen->id . ", Debut: " . $offeredExamen->debut->toString());

        $offeredExamStart = $offeredExamen->debut; // Should be a Carbon instance
        $offeredExamEnd = (clone $offeredExamStart)->addHours(2); // Calculate end assuming 2hr duration

        Log::info("Calculated Offered Exam Slot: " . $offeredExamStart->toString() . " to " . $offeredExamEnd->toString());

        $swappableAttributions = $professeur->attributions()
            ->where('is_involved_in_exchange', false)
            ->whereHas('examen', function ($query) use ($offeredExamStart, $offeredExamEnd) {
                // Ensure the exam being considered (from $professeur->attributions) does not overlap
                // This means its 2-hour slot must end before the offered exam starts,
                // OR its 2-hour slot must start after the offered exam ends.
                $query->where(function ($q) use ($offeredExamStart, $offeredExamEnd) {
                    // Case 1: Swappable exam ends before offered exam starts
                    // DB::raw('debut + INTERVAL \'2 hours\'') <= $offeredExamStart
                    // For simplicity if direct interval arithmetic is complex across DBs via Eloquent:
                    // swappable_exam_start <= offered_exam_start - 2 hours
                     $q->where('debut', '<=', (clone $offeredExamStart)->subHours(2));
                })->orWhere(function ($q) use ($offeredExamStart, $offeredExamEnd) {
                    // Case 2: Swappable exam starts after offered exam ends
                    $q->where('debut', '>=', $offeredExamEnd);
                });
                // The 'fin' column was removed from examens table, so do not query it.
            })
            ->with('examen.module')
            ->get(); // Make sure to get() or paginate()

        Log::info("Found " . $swappableAttributions->count() . " swappable attributions.");
        return response()->json($swappableAttributions);
    }

    public function proposeSwap(Request $request, Echange $echange)
    {
        Log::info("--- proposeSwap START ---");
        Log::info("Echange ID: {$echange->id}, Status: {$echange->status}");

        $request->validate([
            'attribution_accepted_id' => 'required|exists:attributions,id',
        ]);
        Log::info("Validation passed.");

        $user = Auth::user();
        $proposerProfesseur = $user->professeur;

        if (!$proposerProfesseur) {
            Log::error("proposeSwap: Professor profile not found for user ID: " . $user->id);
            return back()->with('error', 'Professor profile not found.');
        }
        Log::info("Proposer Professor ID: " . $proposerProfesseur->id);


        Log::info("Checking echange status. Current status: " . $echange->status);
        if ($echange->status !== 'Open') {
            Log::warning("proposeSwap: Echange status is not 'Open'. Actual: " . $echange->status);
            return back()->with('error', 'This exchange is not open for proposals.');
        }

        $offeredAttribution = $echange->loadMissing('offeredAttribution.examen', 'requester.user')->offeredAttribution;
        $acceptedAttribution = Attribution::with('examen')->find($request->attribution_accepted_id); // Load examen for logging/use

        // Defensive checks (already present, but ensure they are after eager loading)
        if ($offeredAttribution instanceof \Illuminate\Database\Eloquent\Collection) {
            $offeredAttribution = $offeredAttribution->first();
        }
        if ($acceptedAttribution instanceof \Illuminate\Database\Eloquent\Collection) {
            $acceptedAttribution = $acceptedAttribution->first();
        }

        Log::info("Offered Attribution ID: " . ($offeredAttribution->id ?? 'NULL') . ", Examen ID: " . ($offeredAttribution->examen->id ?? 'NULL'));
        Log::info("Accepted (Proposed by Prof B) Attribution ID: " . ($acceptedAttribution->id ?? 'NULL') . ", Examen ID: " . ($acceptedAttribution->examen->id ?? 'NULL'));


        if (!$offeredAttribution || !$acceptedAttribution) {
            Log::warning("proposeSwap: One of the attributions involved in the swap was not found or resolved correctly.");
            return back()->with('error', 'One of the attributions involved in the swap was not found or resolved correctly.');
        }

        Log::info("Checking if accepted attribution belongs to proposer. Accepted Attribution Prof ID: {$acceptedAttribution->professeur_id}, Proposer Prof ID: {$proposerProfesseur->id}");
        if ($acceptedAttribution->professeur_id !== $proposerProfesseur->id) {
            Log::warning("proposeSwap: The proposed assignment does not belong to the proposer.");
            return back()->with('error', 'The proposed assignment is invalid or does not belong to you.');
        }

        Log::info("Checking if accepted attribution is already involved in an exchange. is_involved_in_exchange: " . ($acceptedAttribution->is_involved_in_exchange ? 'true' : 'false'));
        // Prevent proposing an attribution already involved in an open exchange
        if ($acceptedAttribution->is_involved_in_exchange) {
            Log::warning("proposeSwap: The proposed assignment is already involved in an active exchange process.");
            return back()->with('error', 'The proposed assignment is already involved in an active exchange process.');
        }

        Log::info("Calling constraintCheckingService->canSwap");
        // Constraint checking
        if (!$this->constraintCheckingService->canSwap(
            $echange->requester,
            $proposerProfesseur,
            $offeredAttribution,
            $acceptedAttribution
        )) {
            Log::warning("proposeSwap: constraintCheckingService->canSwap returned false."); // THIS IS KEY
            return back()->with('error', 'The proposed swap violates exchange constraints.');
        }
        Log::info("proposeSwap: constraintCheckingService->canSwap returned true.");

        DB::transaction(function () use ($echange, $proposerProfesseur, $acceptedAttribution, $offeredAttribution) {
            $echange->update([
                'professeur_accepter_id' => $proposerProfesseur->id,
                'attribution_accepted_id' => $acceptedAttribution->id,
                'status' => 'Pending_Requester_Decision',
            ]);

            // Mark both attributions as involved in an exchange
            $offeredAttribution->update(['is_involved_in_exchange' => true]);
            $acceptedAttribution->update(['is_involved_in_exchange' => true]);

            // Notify Requester (Prof A)
            Notification::create([
                'user_id' => $echange->requester->user->id,
                'type' => 'exchange_proposal',
                'message' => 'You have a new exchange proposal for ' . $offeredAttribution->examen->name . ' from ' . $proposerProfesseur->user->name . '.',
                'link' => route('professeur.exchanges.index', ['tab' => 'my-open-requests']),
                'data' => ['echange_id' => $echange->id],
            ]);
            Mail::to($echange->requester->user->email)->send(new ExchangeProposalReceivedMail($echange));
        });

        Log::info("proposeSwap END: Proposal sent successfully.");
        return back()->with('success', 'Your proposal has been sent.');
    }

    public function cancelRequest(Echange $echange)
    {
        $user = Auth::user();
        $professeur = $user->professeur;

        if (!$professeur || $echange->professeur_requester_id !== $professeur->id) {
            return back()->with('error', 'Unauthorized to cancel this request.');
        }

        if ($echange->status !== 'Open') {
            return back()->with('error', 'This request cannot be cancelled at this stage.');
        }

        DB::transaction(function () use ($echange) {
            $echange->update(['status' => 'Cancelled_By_Requester']);
            $echange->offeredAttribution->update(['is_involved_in_exchange' => false]);
        });

        return back()->with('success', 'Exchange request cancelled.');
    }

    public function withdrawProposal(Echange $echange)
    {
        $user = Auth::user();
        $professeur = $user->professeur;

        if (!$professeur || $echange->professeur_accepter_id !== $professeur->id) {
            return back()->with('error', 'Unauthorized to withdraw this proposal.');
        }

        if ($echange->status !== 'Pending_Requester_Decision') {
            return back()->with('error', 'This proposal cannot be withdrawn at this stage.');
        }

        DB::transaction(function () use ($echange) {
            $echange->update([
                'professeur_accepter_id' => null,
                'attribution_accepted_id' => null,
                'status' => 'Open',
            ]);

            // Clear flags
            $echange->offeredAttribution->update(['is_involved_in_exchange' => false]);
            if ($echange->acceptedAttribution) {
                $echange->acceptedAttribution->update(['is_involved_in_exchange' => false]);
            }

            // Notify Requester (Prof A)
            Notification::create([
                'user_id' => $echange->requester->user->id,
                'type' => 'exchange_proposal_withdrawn',
                'message' => 'A proposal for your exchange of ' . $echange->offeredAttribution->examen->name . ' has been withdrawn.',
                'link' => route('professeur.exchanges.index', ['tab' => 'my-open-requests']),
                'data' => ['echange_id' => $echange->id],
            ]);
            Mail::to($echange->requester->user->email)->send(new ExchangeProposalWithdrawnMail($echange));
        });

        return back()->with('success', 'Your proposal has been withdrawn.');
    }

    public function acceptSwap(Echange $echange)
    {
        $user = Auth::user();
        $requesterProfesseur = $user->professeur;

        if (!$requesterProfesseur || $echange->professeur_requester_id !== $requesterProfesseur->id) {
            return back()->with('error', 'Unauthorized to accept this swap.');
        }

        if ($echange->status !== 'Pending_Requester_Decision') {
            return back()->with('error', 'This exchange is not in a pending state.');
        }

        $offeredAttribution = $echange->offeredAttribution;
        $acceptedAttribution = $echange->acceptedAttribution;
        $proposerProfesseur = $echange->accepter;

        // Final constraint check before swapping
        if (!$this->constraintCheckingService->canSwap(
            $requesterProfesseur,
            $proposerProfesseur,
            $offeredAttribution,
            $acceptedAttribution
        )) {
            return back()->with('error', 'The swap is no longer valid due to constraint violations.');
        }

        DB::transaction(function () use ($echange, $offeredAttribution, $acceptedAttribution, $requesterProfesseur, $proposerProfesseur) {
            // Perform the swap by updating professeur_id on attributions
            $offeredAttribution->update(['professeur_id' => $proposerProfesseur->id]);
            $acceptedAttribution->update(['professeur_id' => $requesterProfesseur->id]);

            $echange->update(['status' => 'Approved']);

            // Clear involved flags for both attributions
            $offeredAttribution->update(['is_involved_in_exchange' => false]);
            $acceptedAttribution->update(['is_involved_in_exchange' => false]);

            // Notify Proposer (Prof B)
            Notification::create([
                'user_id' => $proposerProfesseur->user->id,
                'type' => 'exchange_approved',
                'message' => 'Your exchange proposal for ' . $offeredAttribution->examen->name . ' has been approved!',
                'link' => route('professeur.exchanges.index', ['tab' => 'exchange-history']),
                'data' => ['echange_id' => $echange->id],
            ]);
            Mail::to($proposerProfesseur->user->email)->send(new ExchangeOutcomeMail($echange, 'approved'));

            // Notify Admins (in-app only)
            // CORRECTED WAY TO FETCH ADMINS:
            $admins = \App\Models\User::where('role', 'admin')->get();

            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'admin_exchange_approved',
                    'message' => 'An exchange between ' . $requesterProfesseur->user->name . ' and ' . $proposerProfesseur->user->name . ' has been approved.',
                    'link' => '#', // Or a link to an admin exchange view
                    'data' => ['echange_id' => $echange->id],
                ]);
            }
        });

        return back()->with('success', 'Exchange approved and assignments swapped.');
    }

    public function refuseSwap(Echange $echange)
    {
        $user = Auth::user();
        $requesterProfesseur = $user->professeur;

        if (!$requesterProfesseur || $echange->professeur_requester_id !== $requesterProfesseur->id) {
            return back()->with('error', 'Unauthorized to refuse this swap.');
        }

        if ($echange->status !== 'Pending_Requester_Decision') {
            return back()->with('error', 'This exchange is not in a pending state.');
        }

        DB::transaction(function () use ($echange) {
            $echange->update([
                'professeur_accepter_id' => null,
                'attribution_accepted_id' => null,
                'status' => 'Refused_By_Requester',
            ]);

            // Clear proposer's attribution flag
            if ($echange->acceptedAttribution) {
                $echange->acceptedAttribution->update(['is_involved_in_exchange' => false]);
            }
            // Requester's attribution remains involved if they want to keep it open for new proposals
            // If the task implies it should go back to 'Open' for new proposals, then the requester's attribution flag should be cleared here.
            // For now, I'll assume it goes back to 'Open' for new proposals, so the requester's attribution flag should be cleared.
            $echange->offeredAttribution->update(['is_involved_in_exchange' => false]);


            // Notify Proposer (Prof B)
            Notification::create([
                'user_id' => $echange->accepter->user->id,
                'type' => 'exchange_refused',
                'message' => 'Your exchange proposal for ' . $echange->offeredAttribution->examen->name . ' has been refused.',
                'link' => route('professeur.exchanges.index', ['tab' => 'my-proposals']),
                'data' => ['echange_id' => $echange->id],
            ]);
            Mail::to($echange->accepter->user->email)->send(new ExchangeOutcomeMail($echange, 'refused'));
        });

        return back()->with('success', 'Exchange proposal refused.');
    }

    public function getUpdatesSummary(Request $request)
    {
        $user = Auth::user();
        $professeur = $user->professeur;

        if (!$professeur) {
            return response()->json(['error' => 'Professor profile not found.'], 404);
        }

        $openRequestsCount = Echange::where('professeur_requester_id', $professeur->id)
            ->whereIn('status', ['Open', 'Pending_Requester_Decision'])
            ->count();

        $myProposalsCount = Echange::where('professeur_accepter_id', $professeur->id)
            ->where('status', 'Pending_Requester_Decision')
            ->count();

        $exchangeMarketCount = Echange::where('status', 'Open')
            ->where('professeur_requester_id', '!=', $professeur->id)
            ->count();

        return response()->json([
            'openRequestsCount' => $openRequestsCount,
            'myProposalsCount' => $myProposalsCount,
            'exchangeMarketCount' => $exchangeMarketCount,
        ]);
    }
}
