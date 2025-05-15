import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // Assuming Shadcn Dialog
import { TranslationContext } from '@/context/TranslationProvider';
import { useContext } from 'react';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    destructive = true, // To style the confirm button as destructive by default
}) {
    const { translations } = useContext(TranslationContext);

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-[var(--card-foreground)]">
                        {title || translations?.confirmation_modal_default_title || 'Confirm Action'}
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {message || translations?.confirmation_modal_default_message || 'Are you sure you want to proceed? This action cannot be undone.'}
                </DialogDescription>
                <DialogFooter className="mt-6 gap-2 sm:justify-end">
                    <DialogClose asChild>
                        <Button variant="outline" onClick={onClose}>
                            {cancelText || translations?.confirmation_modal_cancel_button || 'Cancel'}
                        </Button>
                    </DialogClose>
                    <Button
                        variant={destructive ? 'destructive' : 'default'} // Shadcn destructive variant should be red
                        onClick={() => {
                            onConfirm();
                            onClose(); // Close modal after confirmation
                        }}
                        className={
                            destructive
                                ? 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90'
                                : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90'
                        }
                    >
                        {confirmText || translations?.confirmation_modal_confirm_button || 'Confirm'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
