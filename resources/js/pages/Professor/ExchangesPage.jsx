import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';

// Modals
const ProposeSwapModal = ({ isOpen, onClose, echange, swappableAssignments, onSubmit }) => {
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSelectedAssignment('');
            setProcessing(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!selectedAssignment) {
            toast.error('Please select an assignment to propose.');
            return;
        }
        setProcessing(true);
        onSubmit(echange.id, selectedAssignment);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Propose a Swap for "{echange?.offered_attribution?.examen?.name}"</DialogTitle>
                    <DialogDescription>
                        Select one of your assignments to propose as a swap for this exam duty.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="assignment" className="text-right">
                            Your Assignment
                        </Label>
                        <Select onValueChange={setSelectedAssignment} value={selectedAssignment}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select an assignment" />
                            </SelectTrigger>
                            <SelectContent>
                                {swappableAssignments.map((assignment) => (
                                    <SelectItem key={assignment.id} value={assignment.id}>
                                        {assignment.examen.name} ({format(new Date(assignment.examen.debut), 'dd/MM/yyyy HH:mm')})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={processing}>
                        {processing ? 'Proposing...' : 'Propose Swap'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ConfirmCancellationModal = ({ isOpen, onClose, echange, onSubmit }) => {
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setProcessing(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setProcessing(true);
        onSubmit(echange.id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm Cancellation</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel your exchange request for "{echange?.offered_attribution?.examen?.name}"?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>No, Keep It</Button>
                    <Button variant="destructive" onClick={handleSubmit} disabled={processing}>
                        {processing ? 'Cancelling...' : 'Yes, Cancel Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ReviewSwapProposalModal = ({ isOpen, onClose, echange, onAccept, onRefuse }) => {
    const [processingAccept, setProcessingAccept] = useState(false);
    const [processingRefuse, setProcessingRefuse] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setProcessingAccept(false);
            setProcessingRefuse(false);
        }
    }, [isOpen]);

    const handleAccept = async () => {
        setProcessingAccept(true);
        onAccept(echange.id);
    };

    const handleRefuse = async () => {
        setProcessingRefuse(true);
        onRefuse(echange.id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Review Exchange Proposal</DialogTitle>
                    <DialogDescription>
                        Review the details of the proposed swap and decide to accept or refuse.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p>
                        <strong>Your Offered Assignment:</strong> <br />
                        <strong>{echange?.offered_attribution?.examen?.name}</strong> ({echange?.offered_attribution?.examen?.debut ? format(new Date(echange.offered_attribution.examen.debut), 'dd/MM/yyyy HH:mm') : 'N/A'})
                    </p>
                    <p>
                        <strong>Proposed by:</strong> {echange?.accepter?.user?.name} <br />
                        <strong>Their Offered Assignment:</strong> <br />
                        <strong>{echange?.accepted_attribution?.examen?.name}</strong> ({echange?.accepted_attribution?.examen?.debut ? format(new Date(echange.accepted_attribution.examen.debut), 'dd/MM/yyyy HH:mm') : 'N/A'})
                    </p>
                    {echange?.motif && (
                        <p>
                            <strong>Requester's Motif:</strong> <br />
                            {echange.motif}
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processingAccept || processingRefuse}>Close</Button>
                    <Button variant="destructive" onClick={handleRefuse} disabled={processingAccept || processingRefuse}>
                        {processingRefuse ? 'Refusing...' : 'Refuse'}
                    </Button>
                    <Button onClick={handleAccept} disabled={processingAccept || processingRefuse}>
                        {processingAccept ? 'Accepting...' : 'Accept Swap'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ConfirmWithdrawalModal = ({ isOpen, onClose, echange, onSubmit }) => {
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setProcessing(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setProcessing(true);
        onSubmit(echange.id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm Withdrawal</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to withdraw your proposal for "{echange?.offered_attribution?.examen?.name}"?
                        This will revert the request to 'Open' for the original requester.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>No, Keep It</Button>
                    <Button variant="destructive" onClick={handleSubmit} disabled={processing}>
                        {processing ? 'Withdrawing...' : 'Yes, Withdraw Proposal'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function ExchangesPage({
    exchangeMarket,
    myOpenRequests,
    myProposals,
    exchangeHistory,
    myAttributions, // Passed from controller for 'storeRequest'
}) {
    const { flash } = usePage().props;

    const [activeTab, setActiveTab] = useState('exchange-market');
    const [updatesSummary, setUpdatesSummary] = useState({
        openRequestsCount: 0,
        myProposalsCount: 0,
        exchangeMarketCount: 0,
    });

    // Modals state
    const [isProposeSwapModalOpen, setIsProposeSwapModalOpen] = useState(false);
    const [selectedExchangeForProposal, setSelectedExchangeForProposal] = useState(null);
    const [swappableAssignments, setSwappableAssignments] = useState([]);

    const [isConfirmCancellationModalOpen, setIsConfirmCancellationModalOpen] = useState(false);
    const [selectedExchangeForCancellation, setSelectedExchangeForCancellation] = useState(null);

    const [isReviewSwapProposalModalOpen, setIsReviewSwapProposalModalOpen] = useState(false);
    const [selectedExchangeForReview, setSelectedExchangeForReview] = useState(null);

    const [isConfirmWithdrawalModalOpen, setIsConfirmWithdrawalModalOpen] = useState(false);
    const [selectedExchangeForWithdrawal, setSelectedExchangeForWithdrawal] = useState(null);

    // State for new exchange request form
    const [newRequestAttributionId, setNewRequestAttributionId] = useState('');
    const [newRequestMotif, setNewRequestMotif] = useState('');
    const [isNewRequestProcessing, setIsNewRequestProcessing] = useState(false);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Polling for updates summary
    useEffect(() => {
        const fetchUpdates = () => {
            axios.get(route('professeur.exchanges.updatesSummary'))
                .then(response => {
                    setUpdatesSummary(response.data);
                })
                .catch(error => {
                    console.error('Error fetching updates summary:', error);
                });
        };

        fetchUpdates(); // Initial fetch
        const interval = setInterval(fetchUpdates, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (value) => {
        setActiveTab(value);
        // Optionally reload data for the tab if it's not fresh
        // For simplicity, we'll rely on Inertia's default prop passing for initial load
        // and manual reloads for actions.
    };

    // Handlers for actions
    const handleStoreRequest = async (e) => {
        e.preventDefault();
        setIsNewRequestProcessing(true);
        router.post(route('professeur.exchanges.storeRequest'), {
            attribution_id: newRequestAttributionId,
            motif: newRequestMotif,
        }, {
            onSuccess: () => {
                toast.success('Exchange request created.');
                setNewRequestAttributionId('');
                setNewRequestMotif('');
                setIsNewRequestProcessing(false);
                router.reload({ only: ['myOpenRequests', 'exchangeMarket'] }); // Refresh relevant tabs
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).flat().join(' ');
                toast.error(errorMessage);
                setIsNewRequestProcessing(false);
            },
        });
    };

    const handleProposeSwapClick = async (echange) => {
        setSelectedExchangeForProposal(echange);
        try {
            const response = await axios.get(route('professeur.exchanges.swappableAssignments', echange.id));
            setSwappableAssignments(response.data);
            setIsProposeSwapModalOpen(true);
        } catch (error) {
            toast.error('Could not fetch swappable assignments.');
            console.error('Error fetching swappable assignments:', error);
        }
    };

    const handleProposeSwapSubmit = (echangeId, attributionAcceptedId) => {
        router.post(route('professeur.exchanges.propose', echangeId), {
            attribution_accepted_id: attributionAcceptedId,
        }, {
            onSuccess: () => {
                toast.success('Proposal sent successfully.');
                setIsProposeSwapModalOpen(false);
                router.reload({ only: ['exchangeMarket', 'myProposals', 'myOpenRequests'] });
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).flat().join(' ');
                toast.error(errorMessage);
            },
            onFinish: () => {
                // This is handled by the modal's internal state now
            }
        });
    };

    const handleCancelRequestClick = (echange) => {
        setSelectedExchangeForCancellation(echange);
        setIsConfirmCancellationModalOpen(true);
    };

    const handleCancelRequestSubmit = (echangeId) => {
        router.post(route('professeur.exchanges.cancelRequest', echangeId), {}, {
            onSuccess: () => {
                toast.success('Request cancelled.');
                setIsConfirmCancellationModalOpen(false);
                router.reload({ only: ['myOpenRequests', 'exchangeMarket', 'exchangeHistory'] });
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).flat().join(' ');
                toast.error(errorMessage);
            },
            onFinish: () => {
                // This is handled by the modal's internal state now
            }
        });
    };

    const handleReviewProposalClick = (echange) => {
        setSelectedExchangeForReview(echange);
        setIsReviewSwapProposalModalOpen(true);
    };

    const handleAcceptSwapSubmit = (echangeId) => {
        router.post(route('professeur.exchanges.accept', echangeId), {}, {
            onSuccess: () => {
                toast.success('Swap approved and completed!');
                setIsReviewSwapProposalModalOpen(false);
                router.reload({ only: ['myOpenRequests', 'myProposals', 'exchangeHistory'] });
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).flat().join(' ');
                toast.error(errorMessage);
            },
            onFinish: () => {
                // This is handled by the modal's internal state now
            }
        });
    };

    const handleRefuseSwapSubmit = (echangeId) => {
        router.post(route('professeur.exchanges.refuse', echangeId), {}, {
            onSuccess: () => {
                toast.success('Proposal refused.');
                setIsReviewSwapProposalModalOpen(false);
                router.reload({ only: ['myOpenRequests', 'myProposals', 'exchangeHistory'] });
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).flat().join(' ');
                toast.error(errorMessage);
            },
            onFinish: () => {
                // This is handled by the modal's internal state now
            }
        });
    };

    const handleWithdrawProposalClick = (echange) => {
        setSelectedExchangeForWithdrawal(echange);
        setIsConfirmWithdrawalModalOpen(true);
    };

    const handleWithdrawProposalSubmit = (echangeId) => {
        router.post(route('professeur.exchanges.withdrawProposal', echangeId), {}, {
            onSuccess: () => {
                toast.success('Proposal withdrawn.');
                setIsConfirmWithdrawalModalOpen(false);
                router.reload({ only: ['myProposals', 'exchangeMarket', 'myOpenRequests'] });
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).flat().join(' ');
                toast.error(errorMessage);
            },
            onFinish: () => {
                // This is handled by the modal's internal state now
            }
        });
    };


    return (
        <AppLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Exam Duty Exchanges</h2>}
        >
            <Head title="Exam Duty Exchanges" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="exchange-market">
                                    Exchange Market
                                    {updatesSummary.exchangeMarketCount > 0 && (
                                        <Badge className="ml-2">{updatesSummary.exchangeMarketCount}</Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="my-open-requests">
                                    My Open Requests
                                    {updatesSummary.openRequestsCount > 0 && (
                                        <Badge className="ml-2">{updatesSummary.openRequestsCount}</Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="my-proposals">
                                    My Proposals
                                    {updatesSummary.myProposalsCount > 0 && (
                                        <Badge className="ml-2">{updatesSummary.myProposalsCount}</Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="exchange-history">Exchange History</TabsTrigger>
                            </TabsList>

                            <TabsContent value="exchange-market" className="mt-4">
                                <h3 className="text-lg font-semibold mb-4">Available Exchange Offers</h3>
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle>Request a New Exchange</CardTitle>
                                        <CardDescription>Offer one of your assignments for exchange.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleStoreRequest} className="space-y-4">
                                            <div>
                                                <Label htmlFor="newRequestAttributionId">Your Assignment to Offer</Label>
                                                <Select
                                                    onValueChange={setNewRequestAttributionId}
                                                    value={newRequestAttributionId}
                                                    disabled={isNewRequestProcessing}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select an assignment" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {myAttributions.map((attr) => (
                                                            <SelectItem key={attr.id} value={attr.id}>
                                                                {attr.examen.name} ({format(new Date(attr.examen.debut), 'dd/MM/yyyy HH:mm')})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="newRequestMotif">Motif (Optional)</Label>
                                                <Textarea
                                                    id="newRequestMotif"
                                                    value={newRequestMotif}
                                                    onChange={(e) => setNewRequestMotif(e.target.value)}
                                                    placeholder="Reason for exchange (e.g., scheduling conflict)"
                                                    disabled={isNewRequestProcessing}
                                                />
                                            </div>
                                            <Button type="submit" disabled={isNewRequestProcessing}>
                                                {isNewRequestProcessing ? 'Submitting...' : 'Submit Exchange Request'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {exchangeMarket.length > 0 ? (
                                        exchangeMarket.map((echange) => (
                                            <Card key={echange.id}>
                                                <CardHeader>
                                                    <CardTitle>{echange.offered_attribution.examen.name}</CardTitle>
                                                    <CardDescription>
                                                        Offered by: {echange.requester.user.name}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p>Date: {format(new Date(echange.offered_attribution.examen.debut), 'dd/MM/yyyy HH:mm')}</p>
                                                    {echange.motif && <p>Motif: {echange.motif}</p>}
                                                    <Button
                                                        className="mt-4"
                                                        onClick={() => handleProposeSwapClick(echange)}
                                                    >
                                                        Propose Swap
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <p>No open exchange offers available.</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="my-open-requests" className="mt-4">
                                <h3 className="text-lg font-semibold mb-4">My Open Exchange Requests</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myOpenRequests.length > 0 ? (
                                        myOpenRequests.map((echange) => (
                                            <Card key={echange.id}>
                                                <CardHeader>
                                                    <CardTitle>{echange.offered_attribution.examen.name}</CardTitle>
                                                    <CardDescription>Status: <Badge>{echange.status.replace(/_/g, ' ')}</Badge></CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p>Date: {format(new Date(echange.offered_attribution.examen.debut), 'dd/MM/yyyy HH:mm')}</p>
                                                    {echange.motif && <p>Motif: {echange.motif}</p>}
                                                    {echange.status === 'Pending_Requester_Decision' && echange.accepter && (
                                                        <p className="mt-2">
                                                            Proposal from: {echange.accepter.user.name} for {echange.accepted_attribution.examen.name}
                                                        </p>
                                                    )}
                                                    <div className="mt-4 flex space-x-2">
                                                        {echange.status === 'Open' && (
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() => handleCancelRequestClick(echange)}
                                                            >
                                                                Cancel Request
                                                            </Button>
                                                        )}
                                                        {echange.status === 'Pending_Requester_Decision' && (
                                                            <Button onClick={() => handleReviewProposalClick(echange)}>
                                                                Review Proposal
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <p>You have no open exchange requests.</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="my-proposals" className="mt-4">
                                <h3 className="text-lg font-semibold mb-4">My Exchange Proposals</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myProposals.length > 0 ? (
                                        myProposals.map((echange) => (
                                            <Card key={echange.id}>
                                                <CardHeader>
                                                    <CardTitle>Proposed for: {echange.offered_attribution.examen.name}</CardTitle>
                                                    <CardDescription>Status: <Badge>{echange.status.replace(/_/g, ' ')}</Badge></CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p>Requester: {echange.requester.user.name}</p>
                                                    <p>Your Offered Exam: {echange.accepted_attribution.examen.name} ({format(new Date(echange.accepted_attribution.examen.debut), 'dd/MM/yyyy HH:mm')})</p>
                                                    {echange.status === 'Pending_Requester_Decision' && (
                                                        <Button
                                                            variant="destructive"
                                                            className="mt-4"
                                                            onClick={() => handleWithdrawProposalClick(echange)}
                                                        >
                                                            Withdraw Proposal
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <p>You have no active exchange proposals.</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="exchange-history" className="mt-4">
                                <h3 className="text-lg font-semibold mb-4">Exchange History</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {exchangeHistory.length > 0 ? (
                                        exchangeHistory.map((echange) => (
                                            <Card key={echange.id}>
                                                <CardHeader>
                                                    <CardTitle>
                                                        {echange.status === 'Approved' ? 'Swap Completed' : 'Exchange Terminated'}
                                                    </CardTitle>
                                                    <CardDescription>Status: <Badge>{echange.status.replace(/_/g, ' ')}</Badge></CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p>Original Request: {echange.offered_attribution.examen.name} by {echange.requester.user.name}</p>
                                                    {echange.accepted_attribution && echange.accepter && (
                                                        <p>Proposed Swap: {echange.accepted_attribution.examen.name} by {echange.accepter.user.name}</p>
                                                    )}
                                                    <p>Date: {format(new Date(echange.created_at), 'dd/MM/yyyy HH:mm')}</p>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <p>No exchange history available.</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isProposeSwapModalOpen && (
                <ProposeSwapModal
                    isOpen={isProposeSwapModalOpen}
                    onClose={() => setIsProposeSwapModalOpen(false)}
                    echange={selectedExchangeForProposal}
                    swappableAssignments={swappableAssignments}
                    onSubmit={handleProposeSwapSubmit}
                />
            )}

            {isConfirmCancellationModalOpen && (
                <ConfirmCancellationModal
                    isOpen={isConfirmCancellationModalOpen}
                    onClose={() => setIsConfirmCancellationModalOpen(false)}
                    echange={selectedExchangeForCancellation}
                    onSubmit={handleCancelRequestSubmit}
                />
            )}

            {isReviewSwapProposalModalOpen && (
                <ReviewSwapProposalModal
                    isOpen={isReviewSwapProposalModalOpen}
                    onClose={() => setIsReviewSwapProposalModalOpen(false)}
                    echange={selectedExchangeForReview}
                    onAccept={handleAcceptSwapSubmit}
                    onRefuse={handleRefuseSwapSubmit}
                />
            )}

            {isConfirmWithdrawalModalOpen && (
                <ConfirmWithdrawalModal
                    isOpen={isConfirmWithdrawalModalOpen}
                    onClose={() => setIsConfirmWithdrawalModalOpen(false)}
                    echange={selectedExchangeForWithdrawal}
                    onSubmit={handleWithdrawalProposalSubmit}
                />
            )}
        </AppLayout>
    );
}
