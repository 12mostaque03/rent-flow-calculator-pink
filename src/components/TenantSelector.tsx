
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Tenant } from '@/types/tenant';

interface TenantSelectorProps {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  onSelectTenant: (tenant: Tenant | null) => void;
}

export const TenantSelector = ({ tenants, selectedTenant, onSelectTenant }: TenantSelectorProps) => {
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
          <h3 className="text-lg font-medium text-accent mb-2">{selectedTenant.name}</h3>
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
