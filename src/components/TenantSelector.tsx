
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
    <Card className="bg-gray-800/50 backdrop-blur-lg border-blue-500/20 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Select Tenant</h2>
      
      <Select
        value={selectedTenant?.id || ''}
        onValueChange={(value) => {
          const tenant = tenants.find(t => t.id === value);
          onSelectTenant(tenant || null);
        }}
      >
        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
          <SelectValue placeholder="Choose a tenant..." />
        </SelectTrigger>
        <SelectContent className="bg-gray-700 border-gray-600">
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id} className="text-white hover:bg-gray-600">
              {tenant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedTenant && (
        <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-400 mb-2">{selectedTenant.name}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-300">Monthly Rent:</span>
              <span className="text-white font-medium ml-2">₹{selectedTenant.monthlyRent}</span>
            </div>
            <div>
              <span className="text-gray-300">Electricity Rate:</span>
              <span className="text-white font-medium ml-2">₹{selectedTenant.electricityRate}/unit</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
