
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTenantDialog } from '@/components/AddTenantDialog';
import { TenantSelector } from '@/components/TenantSelector';
import { RentCalculator } from '@/components/RentCalculator';
import { Tenant } from '@/types/tenant';

const Index = () => {
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = () => {
    const savedTenants = localStorage.getItem('tenants');
    if (savedTenants) {
      setTenants(JSON.parse(savedTenants));
    }
  };

  const handleAddTenant = (tenant: Omit<Tenant, 'id'>) => {
    const newTenant: Tenant = {
      ...tenant,
      id: Date.now().toString(),
    };
    const updatedTenants = [...tenants, newTenant];
    setTenants(updatedTenants);
    localStorage.setItem('tenants', JSON.stringify(updatedTenants));
    setShowAddTenant(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-pink-900">
      <div className="container mx-auto p-4 max-w-4xl">
        <header className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Rent <span className="text-pink-400">Calculator</span>
          </h1>
          <p className="text-gray-300">Manage your tenants and calculate monthly rent</p>
        </header>

        <div className="space-y-6">
          <TenantSelector 
            tenants={tenants} 
            selectedTenant={selectedTenant}
            onSelectTenant={setSelectedTenant}
          />

          {selectedTenant && (
            <RentCalculator tenant={selectedTenant} />
          )}
        </div>

        <Button
          onClick={() => setShowAddTenant(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-500/25"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>

        <AddTenantDialog
          open={showAddTenant}
          onClose={() => setShowAddTenant(false)}
          onAddTenant={handleAddTenant}
        />
      </div>
    </div>
  );
};

export default Index;
