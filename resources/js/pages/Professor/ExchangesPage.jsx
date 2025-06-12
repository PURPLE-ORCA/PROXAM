import React, { useState, useEffect, useContext } from 'react';
import { Head, usePage, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';
import { TranslationContext } from '@/context/TranslationProvider';

// Import newly created components
import RequestNewExchangeForm from './Exchanges/RequestNewExchangeForm';
import ExchangeMarketTab from './Exchanges/ExchangeMarketTab';
import MyRequestsTab from './Exchanges/MyRequestsTab';
import MyProposalsTab from './Exchanges/MyProposalsTab';
import HistoryTab from './Exchanges/HistoryTab';
// Import Modals
import ProposeSwapModal from './Exchanges/Modals/ProposeSwapModal';
import ConfirmCancellationModal from './Exchanges/Modals/ConfirmCancellationModal';
import ReviewSwapProposalModal from './Exchanges/Modals/ReviewSwapProposalModal';
import ConfirmWithdrawalModal from './Exchanges/Modals/ConfirmWithdrawalModal';


export default function ExchangesPage({
    exchangeMarket,
    myOpenRequests,
    myProposals,
    exchangeHistory,
    myAttributions, // Passed from controller for 'storeRequest'
}) {
    const { flash } = usePage().props;
    const { translations } = useContext(TranslationContext);

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
    const { data: newRequestData, setData: setNewRequestData, post: postNewRequest, processing: isNewRequestProcessing, errors: newRequestErrors, reset: resetNewRequestForm } = useForm({
        attribution_id: '',
        motif: '',
    });

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
    const handleStoreRequest = (e) => {
        e.preventDefault();
        postNewRequest(route('professeur.exchanges.storeRequest'), {
            onSuccess: () => {
                toast.success(translations?.toasts_exchange_request_created || 'Exchange request created.');
                resetNewRequestForm();
                router.reload({ only: ['myOpenRequests', 'exchangeMarket'] }); // Refresh relevant tabs
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).flat().join(' ');
                toast.error(errorMessage);
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
            toast.error(translations?.toasts_could_not_fetch_swappable_assignments || 'Could not fetch swappable assignments.');
            console.error('Error fetching swappable assignments:', error);
        }
    };

    const handleProposeSwapSubmit = (echangeId, attributionAcceptedId) => {
        router.post(route('professeur.exchanges.propose', echangeId), {
            attribution_accepted_id: attributionAcceptedId,
        }, {
            onSuccess: () => {
                toast.success(translations?.toasts_proposal_sent_successfully || 'Proposal sent successfully.');
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
                toast.success(translations?.toasts_request_cancelled || 'Request cancelled.');
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
                toast.success(translations?.toasts_swap_approved_completed || 'Swap approved and completed!');
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
                toast.success(translations?.toasts_proposal_refused || 'Proposal refused.');
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
                toast.success(translations?.toasts_proposal_withdrawn || 'Proposal withdrawn.');
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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">{translations?.exam_duty_exchanges_page_title || 'Exam Duty Exchanges'}</h2>}
        >
            <Head title={translations?.exam_duty_exchanges_page_title || 'Exam Duty Exchanges'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-transparent overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="exchange-market">
                                    {translations?.exchange_market_tab || 'Exchange Market'}
                                    {updatesSummary.exchangeMarketCount > 0 && (
                                        <Badge className="ml-2">{updatesSummary.exchangeMarketCount}</Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="my-open-requests">
                                    {translations?.my_open_requests_tab || 'My Open Requests'}
                                    {updatesSummary.openRequestsCount > 0 && (
                                        <Badge className="ml-2">{updatesSummary.openRequestsCount}</Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="my-proposals">
                                    {translations?.my_proposals_tab || 'My Proposals'}
                                    {updatesSummary.myProposalsCount > 0 && (
                                        <Badge className="ml-2">{updatesSummary.myProposalsCount}</Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="exchange-history">{translations?.exchange_history_tab || 'Exchange History'}</TabsTrigger>
                            </TabsList>

                            <TabsContent value="exchange-market" className="mt-4">
                                <RequestNewExchangeForm
                                    myAttributions={myAttributions}
                                    data={newRequestData}
                                    setData={setNewRequestData}
                                    onSubmit={handleStoreRequest}
                                    processing={isNewRequestProcessing}
                                    errors={newRequestErrors}
                                />
                                <ExchangeMarketTab
                                    exchangeMarket={exchangeMarket}
                                    onProposeSwapClick={handleProposeSwapClick}
                                />
                            </TabsContent>

                            <TabsContent value="my-open-requests" className="mt-4">
                                <MyRequestsTab
                                    myOpenRequests={myOpenRequests}
                                    onCancelRequestClick={handleCancelRequestClick}
                                    onReviewProposalClick={handleReviewProposalClick}
                                />
                            </TabsContent>

                            <TabsContent value="my-proposals" className="mt-4">
                                <MyProposalsTab
                                    myProposals={myProposals}
                                    onWithdrawProposalClick={handleWithdrawProposalClick}
                                />
                            </TabsContent>

                            <TabsContent value="exchange-history" className="mt-4">
                                <HistoryTab exchangeHistory={exchangeHistory} />
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
                    onSubmit={handleWithdrawProposalSubmit}
                />
            )}
        </AppLayout>
    );
}
