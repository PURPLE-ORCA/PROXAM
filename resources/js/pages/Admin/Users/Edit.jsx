import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import UserForm from './UserForm';

export default function Edit({ userToEdit, availableRoles }) {
    // Renamed prop
    const { translations } = useContext(TranslationContext);
    const { data, setData, put, processing, errors, reset } = useForm({
        name: userToEdit?.name || '',
        email: userToEdit?.email || '',
        role: userToEdit?.role || '',
        password: '', // Password fields are blank by default on edit
        password_confirmation: '',
    });

    useEffect(() => {
        if (userToEdit) {
            setData({
                name: userToEdit.name || '',
                email: userToEdit.email || '',
                role: userToEdit.role || '',
                password: '',
                password_confirmation: '',
            });
        } else {
            reset();
        }
    }, [userToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', { user: userToEdit.id }), {
            preserveScroll: true,
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    const breadcrumbs = [
        { title: translations?.users_breadcrumb || 'Users', href: route('admin.users.index') },
        { title: translations?.edit_user_breadcrumb || 'Edit' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_user_page_title || 'Edit User'} />
            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {(translations?.edit_user_heading || 'Edit User: {name}').replace('{name}', userToEdit.name)}
                </h1>
                <UserForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    availableRoles={availableRoles}
                    isEdit={true}
                />
            </div>
        </AppLayout>
    );
}
