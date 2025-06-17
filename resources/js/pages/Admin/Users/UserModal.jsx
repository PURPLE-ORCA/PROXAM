import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import UserForm from './UserForm';

export default function UserModal({ isOpen, onClose, user, availableRoles }) {
    const isEdit = !!user;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: user?.id || null,
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
            setData({
                id: user?.id || null,
                name: user?.name || '',
                email: user?.email || '',
                role: user?.role || '',
                password: '',
                password_confirmation: '',
            });
        }
    }, [isOpen, user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEdit ? 'admin.users.update' : 'admin.users.store';
        const routeParams = isEdit ? { user: data.id } : {};
        const submission = isEdit ? put : post;

        submission(route(routeName, routeParams), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit User' : 'New User'}</DialogTitle>
                </DialogHeader>
                <UserForm
                    isEdit={isEdit}
                    data={data}
                    setData={setData}
                    errors={errors}
                    availableRoles={availableRoles}
                />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleSubmit} disabled={processing}>
                        {processing ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
