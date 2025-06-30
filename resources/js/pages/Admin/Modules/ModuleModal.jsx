import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import ModuleForm from './ModuleForm';

export default function ModuleModal({ isOpen, onClose, module, filieres, allLevels, allDistinctModuleNames, currentLevel }) {
    const isEdit = !!module;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: null,
        nom: '',
        level_id: '',
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
            setData({
                id: module?.id || null,
                nom: module?.nom || '',
                level_id: module?.level_id?.toString() || currentLevel?.id?.toString() || '',
            });
        }
    }, [isOpen, module, currentLevel]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = isEdit ? 'admin.modules.update' : 'admin.modules.store';
        const routeParams = isEdit ? { module: data.id } : {};
        const submission = isEdit ? put : post;

        submission(route(routeName, routeParams), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Module' : 'New Module'}</DialogTitle>
                </DialogHeader>
                <ModuleForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    filieres={filieres}
                    allLevels={allLevels}
                    allDistinctModuleNames={allDistinctModuleNames}
                    isEdit={isEdit}
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
