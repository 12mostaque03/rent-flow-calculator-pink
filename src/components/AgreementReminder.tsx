
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { Tenant } from '@/types/tenant';

interface AgreementReminderProps {
  tenants: Tenant[];
}

export const AgreementReminder = ({ tenants }: AgreementReminderProps) => {
  const [dismissedReminders, setDismissedReminders] = useState<string[]>([]);

  const calculateDaysRemaining = (startDate: string, duration: number = 11) => {
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + duration);
    
    const today = new Date();
    const timeDiff = endDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return { daysRemaining, endDate };
  };

  const getExpiringTenants = () => {
    return tenants.filter(tenant => {
      if (!tenant.agreementStartDate || dismissedReminders.includes(tenant.id)) {
        return false;
      }
      
      const { daysRemaining } = calculateDaysRemaining(
        tenant.agreementStartDate, 
        tenant.agreementDuration || 11
      );
      
      // Show reminder if 30 days or less remaining, or if already expired
      return daysRemaining <= 30;
    });
  };

  const dismissReminder = (tenantId: string) => {
    setDismissedReminders(prev => [...prev, tenantId]);
  };

  const expiringTenants = getExpiringTenants();

  if (expiringTenants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {expiringTenants.map(tenant => {
        const { daysRemaining, endDate } = calculateDaysRemaining(
          tenant.agreementStartDate!,
          tenant.agreementDuration || 11
        );
        
        const isExpired = daysRemaining <= 0;
        const isUrgent = daysRemaining <= 7 && daysRemaining > 0;
        
        return (
          <Alert 
            key={tenant.id}
            variant={isExpired ? "destructive" : "default"}
            className={`relative ${isUrgent ? 'border-orange-500 bg-orange-50' : ''}`}
          >
            <AlertTriangle className="h-4 w-4" />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-6 w-6 p-0"
              onClick={() => dismissReminder(tenant.id)}
            >
              <X className="h-3 w-3" />
            </Button>
            <AlertTitle className="pr-8">
              {isExpired ? 'Agreement Expired!' : 'Agreement Expiring Soon'}
            </AlertTitle>
            <AlertDescription>
              <div className="space-y-1">
                <p>
                  <strong>{tenant.name}'s</strong> rental agreement 
                  {isExpired ? (
                    <span className="text-red-600 font-semibold"> expired {Math.abs(daysRemaining)} days ago</span>
                  ) : (
                    <span className={`font-semibold ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`}>
                      {' '}expires in {daysRemaining} days
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Agreement end date: {endDate.toLocaleDateString()}
                </p>
                {isExpired ? (
                  <p className="text-sm text-red-600 font-medium mt-2">
                    ⚠️ Please renew the agreement immediately or discuss next steps with the tenant.
                  </p>
                ) : (
                  <p className="text-sm text-blue-600 font-medium mt-2">
                    💡 Consider discussing agreement renewal with the tenant soon.
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};
