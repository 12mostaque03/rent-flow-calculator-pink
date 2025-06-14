
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Edit } from 'lucide-react';
import { Tenant } from '@/types/tenant';
import { useToast } from '@/hooks/use-toast';

interface TenantSelectorProps {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  onSelectTenant: (tenant: Tenant | null) => void;
  onDeleteTenant: (tenantId: string) => void;
  onEditTenant: (tenant: Tenant) => void;
}

export const TenantSelector = ({ tenants, selectedTenant, onSelectTenant, onDeleteTenant, onEditTenant }: TenantSelectorProps) => {
  const { toast } = useToast();

  const handleDeleteTenant = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      onDeleteTenant(tenantId);
      toast({
        title: "Tenant Deleted",
        description: `${tenant.name} has been removed successfully`,
      });
    }
  };

  return (
    <Card className="bg-card/95 backdrop-blur-lg border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Select Tenant</h2>
      
      <Select
        value={selectedTenant?.id || ''}
        onValueChange={(value) => {
          const tenant = tenants.find(t => t.id === value);
          onSelectTenant(tenant || null);
        }}
      >
        <SelectTrigger className="bg-input border-border text-foreground">
          <SelectValue placeholder="Choose a tenant..." />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id} className="text-foreground hover:bg-accent/20">
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedTenant && (
        <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-accent">{selectedTenant.name}</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => onEditTenant(selectedTenant)}
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                onClick={() => handleDeleteTenant(selectedTenant.id)}
                variant="destructive"
                size="sm"
                className="bg-destructive hover:bg-destructive/90"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Monthly Rent:</span>
              <span className="text-foreground font-medium ml-2">₹{selectedTenant.monthlyRent}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Electricity Rate:</span>
              <span className="text-foreground font-medium ml-2">₹{selectedTenant.electricityRate}/unit</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
