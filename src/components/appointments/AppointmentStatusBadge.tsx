import { Badge, BadgeProps } from '@/components/ui/badge';
import { AppointmentStatus } from '@/types/appointment';

const statusVariantMap: Record<AppointmentStatus, BadgeProps['variant']> = {
  [AppointmentStatus.SCHEDULED]: 'outline',
  [AppointmentStatus.CONFIRMED]: 'default',
  [AppointmentStatus.IN_PROGRESS]: 'secondary',
  [AppointmentStatus.COMPLETED]: 'default',
  [AppointmentStatus.CANCELLED]: 'outline',
  [AppointmentStatus.NO_SHOW]: 'destructive',
};

const statusColorMap: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [AppointmentStatus.CONFIRMED]: 'bg-green-100 text-green-800 border-green-200',
  [AppointmentStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [AppointmentStatus.COMPLETED]: 'bg-purple-100 text-purple-800 border-purple-200',
  [AppointmentStatus.CANCELLED]: 'bg-gray-100 text-gray-800 border-gray-200',
  [AppointmentStatus.NO_SHOW]: 'bg-red-100 text-red-800 border-red-200',
};

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  return (
    <Badge 
      variant={statusVariantMap[status]}
      className={cn(
        'capitalize',
        statusColorMap[status],
        className
      )}
    >
      {status.toLowerCase().replace(/_/g, ' ')}
    </Badge>
  );
}

// Helper function to handle class name merging
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
