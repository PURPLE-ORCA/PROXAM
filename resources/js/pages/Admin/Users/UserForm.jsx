import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TranslationContext } from '@/context/TranslationProvider';
import { Link } from '@inertiajs/react';
import { useContext } from 'react';
import { Icon } from '@iconify/react';


export default function UserForm({ data, setData, errors, processing, onSubmit, availableRoles, isEdit = false }) {
    const { translations } = useContext(TranslationContext);

    const getRoleTranslation = (roleKey) => {
        if (!roleKey) return translations?.role_undefined || 'N/A';
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

            {/* Conditionally render password fields only for create (not edit) */}
            {!isEdit && (
                <>
                    <div>
                        <Label htmlFor="password" className="text-[var(--foreground)]">
                            {translations?.user_form_password_label || 'Password'} *
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                            isInvalid={errors.password}
                        />
                        {errors.password && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.password}</p>}
                    </div>

                    <div>
                        <Label htmlFor="password_confirmation" className="text-[var(--foreground)]">
                            {translations?.user_form_password_confirm_label || 'Confirm Password'} *
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            className="mt-1 block w-full border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-[var(--ring)]"
                            isInvalid={errors.password_confirmation}
                        />
                        {errors.password_confirmation && <p className="mt-1 text-sm text-[var(--destructive)]">{errors.password_confirmation}</p>}
                    </div>
                </>
            )}

            {/* Notice for password handling can be removed or adapted if passwords are not handled here at all in edit mode */}
            {isEdit && (
                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/30">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Icon icon="mdi:information" className="h-5 w-5 text-blue-400 dark:text-blue-300" aria-hidden="true" />
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-blue-700 dark:text-blue-200">
                                {translations?.user_form_password_admin_edit_notice ||
                                    'Password changes should be done by the user via profile settings or "Forgot Password" link.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
