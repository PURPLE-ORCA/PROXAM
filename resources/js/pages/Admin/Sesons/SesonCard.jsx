import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/react';
import { Link } from '@inertiajs/react';

export default function SesonCard({
    seson,
    auth,
    onEdit,
    onDelete,
    onBatchAssign,
    onApprove,
    processingBatchAssignment,
    processingApproval,
}) {
    const canManage = auth.abilities?.is_admin || auth.abilities?.is_rh;
    const isAdmin = auth.abilities?.is_admin;

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{seson.code}</CardTitle>
                    <CardDescription>{seson.annee_uni.annee}</CardDescription>
                </div>
                {canManage && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Icon icon="mdi:dots-vertical" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(seson)}>Edit</DropdownMenuItem>
                            {isAdmin && (
                                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(seson)}>
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
                {seson.assignments_approved_at ? (
                    <div className="space-y-2">
                        <Badge variant="outline" className="w-full justify-center">
                            Approved: {new Date(seson.assignments_approved_at).toLocaleDateString()}
                        </Badge>
                        {seson.notifications_sent_at ? (
                            <Badge variant="default " className="w-full justify-center">
                                Notified: {new Date(seson.notifications_sent_at).toLocaleDateString()}
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="w-full justify-center">
                                Notification Pending/Failed
                            </Badge>
                        )}
                    </div>
                ) : (
                    <Badge variant="secondary" className="w-full justify-center">
                        Pending Approval
                    </Badge>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                {canManage && (
                    <Button variant="outline" className="w-full" onClick={() => onBatchAssign(seson)} disabled={processingBatchAssignment}>
                        {processingBatchAssignment ? (
                            <Icon icon="mdi:loading" className="mr-2 animate-spin" />
                        ) : (
                            <Icon icon="mdi:robot-outline" className="mr-2" />
                        )}
                        Run Assignments
                    </Button>
                )}
                {isAdmin && !seson.assignments_approved_at && (
                    <Button className="w-full" onClick={() => onApprove(seson)} disabled={processingApproval}>
                        {processingApproval ? (
                            <Icon icon="mdi:loading" className="mr-2 animate-spin" />
                        ) : (
                            <Icon icon="mdi:check-decagram-outline" className="mr-2" />
                        )}
                        Approve & Notify
                    </Button>
                )}
                {isAdmin && seson.assignments_approved_at && (
                    <a href={route('admin.sesons.download-convocations', seson.id)} className="w-full">
                        <Button variant="ghost" className="w-full bg-[var(--fmpo)]">
                            <Icon icon="mdi:download-box-outline" className="mr-2" />
                            Download Convocations
                        </Button>
                    </a>
                )}
            </CardFooter>
        </Card>
    );
}
