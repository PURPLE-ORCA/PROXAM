import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TranslationContext } from '@/context/TranslationProvider';
import { Icon } from '@iconify/react';
import { useContext } from 'react';

export default function LanguageSwitcher() {
    const { translations, switchLanguage } = useContext(TranslationContext);
    const currentUiLang = typeof window !== 'undefined' ? localStorage.getItem('lang') || 'en' : 'en';

    const locals = [
        { locale: 'en', label: translations?.language_english || 'English' },
        { locale: 'fr', label: translations?.language_french || 'Français' },
        { locale: 'ar', label: translations?.language_arabic || 'العربية' },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Icon icon="fa-solid:language" className="h-4 w-4 text-[var(--fmpo)]" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {locals.map((loc) => (
                    <DropdownMenuItem
                        key={loc.locale}
                        onClick={() => switchLanguage(loc.locale)}
                        className={`flex items-center justify-between ${loc.locale === 'ar' ? 'font-arabic flex-row-reverse justify-end' : ''}`}
                    >
                        <span>{loc.label}</span>
                        {loc.locale === currentUiLang && <Icon icon="mdi:check" className="h-4 w-4 text-[var(--primary)]" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
