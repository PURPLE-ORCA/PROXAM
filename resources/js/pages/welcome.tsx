import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type PageProps, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion, type Variants } from 'framer-motion';

const FADE_IN_UP_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Welcome() {
    const { auth } = usePage<PageProps<SharedData>>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Tableau de bord
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Registtre
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <div className="flex w-full flex-col items-center justify-center px-4 opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="w-full max-w-3xl space-y-12 py-12 text-center lg:py-16">
                        {/* Hero Section */}
                        <motion.section
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
                            className="space-y-4"
                        >
                            <motion.h1 variants={FADE_IN_UP_VARIANTS} className="text-4xl font-bold text-gray-900 lg:text-5xl dark:text-white">
                                PROXAM
                            </motion.h1>
                            <motion.p variants={FADE_IN_UP_VARIANTS} className="text-lg text-gray-600 lg:text-xl dark:text-gray-300">
                                Gestion Efficace des Examens Académiques & des Affectations des Professeurs.
                            </motion.p>
                            <motion.div variants={FADE_IN_UP_VARIANTS}>
                                <Badge variant="outline">Statut: En Production</Badge>
                            </motion.div>
                        </motion.section>

                        {/* About Section */}
                        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-800 dark:text-gray-100">À Propos de PROXAM</h2>
                            <p className="leading-relaxed text-gray-700 dark:text-gray-400">
                                PROXAM est conçu pour simplifier le processus complexe d'affectation des professeurs aux examens académiques à la
                                Faculté de Médecine et de Pharmacie d'Oujda, assurant l'équité, le respect des contraintes et l'amélioration de
                                l'efficacité administrative.
                            </p>
                        </motion.section>

                        {/* Development Team Section */}
                        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
                            <h2 className="mb-3 text-2xl font-semibold text-gray-800 dark:text-gray-100">Développé Par</h2>
                            <p className="text-gray-700 dark:text-gray-400">
                                <a href="https://github.com/PURPLE-ORCA" target="_blank" rel="noopener noreferrer" className="text-black hover:underline dark:text-white">
                                    El Moussaoui Mohammed
                                </a>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">Faculté de Médecine et de Pharmacie, Oujda</p>
                        </motion.section>

                        {/* Call to Action */}
                        {!auth.user && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.6 }} className="mt-8">
                                <Link href={route('login')}>
                                    <Button size="lg" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                                        Se Connecter pour Accéder
                                    </Button>
                                </Link>
                            </motion.div>
                        )}
                    </main>
                </div>

                <footer className="w-full py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    © {new Date().getFullYear()} PROXAM. Tous droits réservés.
                </footer>
            </div>
        </>
    );
}
