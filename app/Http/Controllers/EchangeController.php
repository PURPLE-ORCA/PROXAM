<?php

namespace App\Http\Controllers;

use App\Models\Echange;
use App\Http\Requests\StoreEchangeRequest;
use App\Http\Requests\UpdateEchangeRequest;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail; // Add this
use App\Mail\ExchangeProposalReceivedMail; // Add this

class EchangeController extends Controller
{
    public function proposeSwap(Echange $echange)
    {
        // Assuming $offeredAttribution and $proposerProfesseur are available in this context
        // For demonstration, let's assume they are loaded or passed in.
        // In a real scenario, you'd fetch them based on $echange relationships.
        $offeredAttribution = $echange->offeredAttribution; // Assuming this relationship exists
        $proposerProfesseur = $echange->proposerProfesseur; // Assuming this relationship exists

        // Make sure all these relationships are loaded and valid
        $echange->loadMissing(['requester.user', 'offeredAttribution.examen.module', 'proposerProfesseur.user']);

        // Use this for message construction
        $examNameForMessage = $echange->offeredAttribution->examen->module->nom ?? // Try module name first
                               ($echange->offeredAttribution->examen->name ?? // Fallback to a direct 'name' attribute if it exists
                               'an unspecified exam'); // Final fallback

        Notification::create([
            'user_id' => $echange->requester->user->id,
            'type' => 'exchange_proposal',
            // Use $examNameForMessage
            'message' => 'You have a new exchange proposal for ' . $examNameForMessage . ' from ' . $echange->proposerProfesseur->user->name . '.',
            'link' => route('professeur.exchanges.index', ['tab' => 'my-open-requests']),
            'data' => ['echange_id' => $echange->id],
        ]);

        // Send email notification
        Mail::to($echange->requester->user->email)->send(new ExchangeProposalReceivedMail($echange, $examNameForMessage));

        // Further logic for proposeSwap...
    }

    public function acceptSwap(Echange $echange)
    {
        // Assuming $proposerProfesseur, $offeredAttribution, and $requesterProfesseur are available
        // In a real scenario, you'd fetch them based on $echange relationships.
        $proposerProfesseur = $echange->proposerProfesseur;
        $offeredAttribution = $echange->offeredAttribution;
        $requesterProfesseur = $echange->requester;

        // Notify Proposer (Prof B)
        // Ensure $proposerProfesseur->user, $offeredAttribution->examen->module are loaded
        $proposerProfesseur->loadMissing('user');
        $offeredAttribution->loadMissing('examen.module'); // Eager load module

        $examNameForProposer = $offeredAttribution->examen->module->nom ?? 'the exam';

        Log::info("ACCEPT_SWAP_NOTIFY_PROPOSER: Attempting for User ID: " . ($proposerProfesseur->user?->id ?? 'USER NULL FOR PROPOSER') . " Echange ID: {$echange->id}");
        Notification::create([
            'user_id' => $proposerProfesseur->user->id,
            'type' => 'exchange_approved',
            'message' => 'Your exchange proposal for ' . $examNameForProposer . ' has been approved!',
            'link' => route('professeur.exchanges.index', ['tab' => 'exchange-history']),
            'data' => ['echange_id' => $echange->id],
        ]);
        Log::info("ACCEPT_SWAP_NOTIFY_PROPOSER: CREATED for User ID: " . ($proposerProfesseur->user?->id ?? 'USER NULL FOR PROPOSER'));

        // Notify Admins (in-app only)
        $admins = \App\Models\User::where('role', 'admin')->get();
        // Ensure $requesterProfesseur->user and $proposerProfesseur->user are loaded
        $requesterProfesseur->loadMissing('user');
        $proposerProfesseur->loadMissing('user');

        foreach ($admins as $admin) {
            Log::info("ACCEPT_SWAP_NOTIFY_ADMIN: Attempting for Admin User ID: {$admin->id} Echange ID: {$echange->id}");
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'admin_exchange_approved',
                'message' => 'An exchange between ' . $requesterProfesseur->user->name . ' and ' . $proposerProfesseur->user->name . ' has been approved.',
                'link' => '#', // Or a link to an admin exchange view
                'data' => ['echange_id' => $echange->id],
            ]);
            Log::info("ACCEPT_SWAP_NOTIFY_ADMIN: CREATED for Admin User ID: {$admin->id}");
        }

        // Further logic for acceptSwap...
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEchangeRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Echange $echange)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Echange $echange)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEchangeRequest $request, Echange $echange)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Echange $echange)
    {
        //
    }
}
