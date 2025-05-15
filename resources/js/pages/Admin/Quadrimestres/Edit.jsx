import { TranslationContext } from '@/context/TranslationProvider';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useContext, useEffect } from 'react';
import QuadrimestreForm from './QuadrimestreForm';

export default function Edit({ quadrimestre, sesons }) {
    const { translations } = useContext(TranslationContext);
    const { data, setData, put, processing, errors, reset } = useForm({
        code: quadrimestre?.code || '',
        seson_id: quadrimestre?.seson_id || '',
    });

    useEffect(() => {
        if (quadrimestre) {
            setData({
                code: quadrimestre.code || '',
                seson_id: quadrimestre.seson_id || '',
            });
        } else {
            reset();
        }
    }, [quadrimestre]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.quadrimestres.update', { quadrimestre: quadrimestre.id }), {
            preserveScroll: true,
        });
    };

    const breadcrumbs = [
        { title: translations?.quadrimestres_breadcrumb || 'Semesters', href: route('admin.quadrimestres.index') },
        { title: translations?.edit_quadrimestre_breadcrumb || 'Edit' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translations?.edit_quadrimestre_page_title || 'Edit Semester'} />

            <div className="mx-auto mt-6 max-w-2xl rounded-md border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h1 className="mb-6 text-xl font-semibold text-[var(--card-foreground)]">
                    {(translations?.edit_quadrimestre_heading || 'Edit Semester: {code}').replace('{code}', quadrimestre.code)}
                </h1>
                <QuadrimestreForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    sesons={sesons}
                    isEdit={true}
                />
            </div>
        </AppLayout>
    );
}
