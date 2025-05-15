import { TranslationContext } from '@/context/TranslationProvider'; 
import { usePage } from '@inertiajs/react';
import { useContext, useEffect } from 'react'; 
import { toast } from 'sonner';
import { Toaster } from './ui/sonner'; 

export default function SonnerToastProvider({ children }) {
    const { flash } = usePage().props;
    const { translations } = useContext(TranslationContext); 

    useEffect(() => {
        const getTranslatedMessage = (key) => {
            return translations?.[key] || key || 'An update occurred.';
        };

        if (flash.success) {
            toast.success(getTranslatedMessage(flash.success));
        }

        if (flash.error) {
            toast.error(getTranslatedMessage(flash.error));
        }
    }, [flash, translations]);

    return (
        <>
            {children}
            <Toaster position="bottom-right" richColors />
        </>
    );
}
