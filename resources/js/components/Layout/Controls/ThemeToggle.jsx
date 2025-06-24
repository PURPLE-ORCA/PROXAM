import { useAppearance } from '@/hooks/use-appearance';
import { Button } from '../../ui/button';
import { Icon } from '@iconify/react';

export default function ThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div className="flex items-center gap-1 rounded-md border bg-muted p-1">
            <Button variant={appearance === 'light' ? 'secondary' : 'ghost'} size="sm" onClick={() => updateAppearance('light')}>
                <Icon icon="mdi:weather-sunny" className="h-5 w-5" />
            </Button>
            <Button variant={appearance === 'dark' ? 'secondary' : 'ghost'} size="sm" onClick={() => updateAppearance('dark')}>
                <Icon icon="mdi:weather-night" className="h-5 w-5" />
            </Button>
            <Button variant={appearance === 'system' ? 'secondary' : 'ghost'} size="sm" onClick={() => updateAppearance('system')}>
                <Icon icon="mdi:laptop" className="h-5 w-5" />
            </Button>
        </div>
    );
}
