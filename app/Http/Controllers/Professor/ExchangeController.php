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
        $user = Auth::user();
        $professeur = $user->professeur;

        if (!$professeur) {
            Log::error("Professor profile not found for user ID: " . $user->id);
            return response()->json(['error' => 'Professor profile not found.'], 404);
        }

        $offeredAttribution = $echange->loadMissing('offeredAttribution.examen')->offeredAttribution;

        if (!$offeredAttribution) {
            Log::error("OfferedAttribution not found for Echange ID: {$echange->id}");
            return response()->json(['error' => 'Details of the offered assignment are missing.'], 500);
        }

        $offeredExamen = $offeredAttribution->examen;
        if (!$offeredExamen || !$offeredExamen->debut) {
            Log::error("Exam details or debut time missing for Offered Attribution ID: {$offeredAttribution->id}");
            return response()->json(['error' => 'Exam details for the offered assignment are incomplete.'], 500);
        }

        $offeredExamStart = $offeredExamen->debut;
        $offeredExamEnd = (clone $offeredExamStart)->addHours(2);

        $swappableAttributions = $professeur->attributions()
            ->where('is_involved_in_exchange', false)
            ->whereHas('examen', function ($query) use ($offeredExamStart, $offeredExamEnd) {
                $query->where(function ($q) use ($offeredExamStart, $offeredExamEnd) {
                     $q->where('debut', '<=', (clone $offeredExamStart)->subHours(2));
                })->orWhere(function ($q) use ($offeredExamStart, $offeredExamEnd) {
                    $q->where('debut', '>=', $offeredExamEnd);
                });
            })
            ->with('examen.module')
            ->get();

        return response()->json($swappableAttributions);
    }

    public function proposeSwap(Request $request, Echange $echange)
    {
        $request->validate([
            'attribution_accepted_id' => 'required|exists:attributions,id',
        ]);

        $user = Auth::user();
        $proposerProfesseur = $user->professeur;

        if (!$proposerProfesseur) {
            Log::error("proposeSwap: Professor profile not found for user ID: " . $user->id);
            return back()->with('error', 'Professor profile not found.');
        }

        if ($echange->status !== 'Open') {
            Log::warning("proposeSwap: Echange status is not 'Open'. Actual: " . $echange->status);
            return back()->with('error', 'This exchange is not open for proposals.');
        }

        // Load relationships needed for checks and notifications
        $echange->loadMissing(['requester.user', 'offeredAttribution.examen.module', 'accepter.user']);
        $offeredAttribution = $echange->offeredAttribution;
        $acceptedAttribution = Attribution::with('examen')->find($request->attribution_accepted_id);

        // Defensive checks
        if ($offeredAttribution instanceof \Illuminate\Database\Eloquent\Collection) {
            $offeredAttribution = $offeredAttribution->first();
        }
        if ($acceptedAttribution instanceof \Illuminate\Database\Eloquent\Collection) {
            $acceptedAttribution = $acceptedAttribution->first();
        }

        if (!$offeredAttribution || !$acceptedAttribution) {
            Log::warning("proposeSwap: One of the attributions involved in the swap was not found or resolved correctly.");
            return back()->with('error', 'One of the attributions involved in the swap was not found or resolved correctly.');
        }

        if ($acceptedAttribution->professeur_id !== $proposerProfesseur->id) {
            Log::warning("proposeSwap: The proposed assignment does not belong to the proposer.");
            return back()->with('error', 'The proposed assignment is invalid or does not belong to you.');
        }

        if ($acceptedAttribution->is_involved_in_exchange) {
            Log::warning("proposeSwap: The proposed assignment is already involved in an active exchange process.");
            return back()->with('error', 'The proposed assignment is already involved in an active exchange process.');
        }

        // Constraint checking
        if (!$this->constraintCheckingService->canSwap(
            $echange->requester,
            $proposerProfesseur,
            $offeredAttribution,
            $acceptedAttribution
        )) {
            Log::warning("proposeSwap: constraintCheckingService->canSwap returned false.");
            return back()->with('error', 'The proposed swap violates exchange constraints.');
        }

        DB::transaction(function () use ($echange, $proposerProfesseur, $acceptedAttribution, $offeredAttribution) {
            $echange->update([
                'professeur_accepter_id' => $proposerProfesseur->id,
                'attribution_accepted_id' => $acceptedAttribution->id,
                'status' => 'Pending_Requester_Decision',
            ]);

            // Mark both attributions as involved in an exchange
            $offeredAttribution->update(['is_involved_in_exchange' => true]);
            $acceptedAttribution->update(['is_involved_in_exchange' => true]);

            // Refresh the echange model to get the newly set accepter relationship
            $echange->refresh();
            // Ensure accepter.user is loaded for the email
            $echange->loadMissing('accepter.user');

            // Use this for message construction
            $examNameForMessage = $echange->offeredAttribution->examen->module->nom ?? // Try module name first
                                   ($echange->offeredAttribution->examen->name ?? // Fallback to a direct 'name' attribute if it exists
                                   'an unspecified exam'); // Final fallback

            Notification::create([
                'user_id' => $echange->requester->user->id,
                'type' => 'exchange_proposal',
                'message' => 'You have a new exchange proposal for ' . $examNameForMessage . ' from ' . $proposerProfesseur->user->name . '.',
                'link' => route('professeur.exchanges.index', ['tab' => 'my-open-requests']),
                'data' => ['echange_id' => $echange->id],
            ]);
            Mail::to($echange->requester->user->email)->send(new ExchangeProposalReceivedMail($echange, $examNameForMessage));
        });

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
