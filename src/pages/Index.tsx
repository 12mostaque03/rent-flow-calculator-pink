
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';
import { AddTenantDialog } from '@/components/AddTenantDialog';
import { TenantSelector } from '@/components/TenantSelector';
import { RentCalculator } from '@/components/RentCalculator';
import { Tenant } from '@/types/tenant';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Mock authentication for demo - replace with actual Google OAuth
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadTenants();
    }
  }, []);

  const loadTenants = () => {
    const savedTenants = localStorage.getItem('tenants');
    if (savedTenants) {
      setTenants(JSON.parse(savedTenants));
    }
  };

  const handleGoogleLogin = () => {
    // This is a mock implementation - replace with actual Google OAuth
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    loadTenants();
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-pink-500/20 shadow-2xl max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Rent <span className="text-pink-400">Calculator</span>
            </h1>
            <p className="text-gray-300">Manage your tenants and calculate monthly rent</p>
          </div>
          <GoogleAuthButton onLogin={handleGoogleLogin} />
        </div>
      </div>
    );
  }

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
