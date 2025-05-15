import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext } from 'react';
import UserForm from './UserForm';

export default function Create({ availableRoles }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        role: '', // Default to empty or a sensible default like 'professeur'
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            preserveScroll: true,
            onSuccess: () => reset('password', 'password_confirmation'), // Keep other fields for quick re-entry if needed
        });
    };

    const breadcrumbs = [
        { title: translations?.users_breadcrumb || 'Users', href: route('admin.users.index') },
        { title: translations?.create_user_breadcrumb || 'Create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.create_user_page_title || 'Create User'} />
            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">{translations?.create_user_heading || 'New User'}</h1>
                <UserForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    availableRoles={availableRoles}
                />
            </div>
        </AppLayout>
    );
}
