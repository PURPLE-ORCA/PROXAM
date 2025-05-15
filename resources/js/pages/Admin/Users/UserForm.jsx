import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslationContext } from '@/context/TranslationProvider';
import { Link } from '@inertiajs/react';
import { useContext } from 'react';

export default function UserForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    availableRoles, // Array of role strings: ['admin', 'rh', ...]
    isEdit = false,
}) {
    const { translations } = useContext(TranslationContext);

    // Helper to get translated role name or fallback
    const getRoleTranslation = (roleKey) => {
        const translationKey = `role_${roleKey}`;
        return translations?.[translationKey] || roleKey.charAt(0).toUpperCase() + roleKey.slice(1);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div>
                <Label htmlFor="name" className="text-[var(--foreground)]">
                    {translations?.user_form_name_label || 'Name'} *
                </Label>
                <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                    isInvalid={errors.name}
                />
                {errors.name && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.name}</p>}
            </div>

            <div>
                <Label htmlFor="email" className="text-[var(--foreground)]">
                    {translations?.user_form_email_label || 'Email'} *
                </Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                    isInvalid={errors.email}
                />
                {errors.email && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.email}</p>}
            </div>

            <div>
                <Label htmlFor="role" className="text-[var(--foreground)]">
                    {translations?.user_form_role_label || 'Role'} *
                </Label>
                <Select value={data.role || ''} onValueChange={(value) => setData('role', value)} disabled={processing} required>
                    <SelectTrigger className="mt-1 w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]">
                        <SelectValue placeholder={translations?.user_form_select_role_placeholder || 'Select a role'} />
                    </SelectTrigger>
                    <SelectContent className="border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)]">
                        {(availableRoles || []).map((role) => (
                            <SelectItem key={role} value={role}>
                                {getRoleTranslation(role)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.role && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.role}</p>}
            </div>

            <div>
                <Label htmlFor="password" className="text-[var(--foreground)]">
                    {translations?.user_form_password_label || 'Password'} {isEdit ? '' : '*'}
                </Label>
                <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    required={!isEdit} // Password required on create, optional on edit
                    className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                    isInvalid={errors.password}
                />
                {isEdit && (
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {translations?.user_form_password_edit_notice || 'Leave blank to keep current password.'}
                    </p>
                )}
                {errors.password && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.password}</p>}
            </div>

            <div>
                <Label htmlFor="password_confirmation" className="text-[var(--foreground)]">
                    {translations?.user_form_password_confirm_label || 'Confirm Password'} {isEdit && !data.password ? '' : '*'}
                </Label>
                <Input
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    required={!isEdit || (isEdit && data.password)} // Required if creating or if password field is filled during edit
                    className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                    isInvalid={errors.password_confirmation}
                />
                {errors.password_confirmation && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.password_confirmation}</p>}
            </div>

            <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-[var(--border)] pt-6">
                <Button variant="outline" type="button" asChild>
                    <Link href={route('admin.users.index')}>{translations?.cancel_button || 'Annuler'}</Link>
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
                >
                    {processing
                        ? translations?.saving_button || 'Enregistrement...'
                        : isEdit
                          ? translations?.update_button || 'Mettre à Jour'
                          : translations?.save_button || 'Enregistrer'}
                </Button>
            </div>
        </form>
    );
}
