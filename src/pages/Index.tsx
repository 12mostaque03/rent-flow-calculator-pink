
import { useState, useEffect } from 'react';
import { Plus, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTenantDialog } from '@/components/AddTenantDialog';
import { TenantSelector } from '@/components/TenantSelector';
import { RentCalculator } from '@/components/RentCalculator';
import { RentHistoryView } from '@/components/RentHistoryView';
import { Tenant } from '@/types/tenant';

const Index = () => {
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showRentHistory, setShowRentHistory] = useState(false);
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
    <div className="min-h-screen bg-background relative">
      {/* Watermark */}
      <div className="fixed inset-x-0 bottom-0 flex items-end justify-center pointer-events-none z-0 pb-8">
        <div className="flex flex-col items-center">
          <p className="text-accent/10 text-2xl font-normal select-none mb-2">
            Powered by
          </p>
          <p className="text-accent/10 text-8xl font-bold select-none">
            MOSTAQUE
          </p>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl relative z-10">
        <header className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Rent <span className="text-primary">Calculator</span>
          </h1>
          <p className="text-muted-foreground">Manage your tenants and calculate monthly rent</p>
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

        {/* Add Tenant Button */}
        <Button
          onClick={() => setShowAddTenant(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 z-20"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>

        {/* View Rent History Button */}
        <Button
          onClick={() => setShowRentHistory(true)}
          className="fixed bottom-6 right-24 w-14 h-14 rounded-full bg-success hover:bg-success/90 shadow-lg shadow-success/25 z-20"
          size="icon"
        >
          <List className="w-6 h-6" />
        </Button>

        <AddTenantDialog
          open={showAddTenant}
          onClose={() => setShowAddTenant(false)}
          onAddTenant={handleAddTenant}
        />

        {showRentHistory && (
          <RentHistoryView
            tenants={tenants}
            onClose={() => setShowRentHistory(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
