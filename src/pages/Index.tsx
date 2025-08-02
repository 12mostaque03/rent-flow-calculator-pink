
import { useState, useEffect } from 'react';
import { Plus, List, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddTenantDialog } from '@/components/AddTenantDialog';
import { TenantSelector } from '@/components/TenantSelector';
import { RentCalculator } from '@/components/RentCalculator';
import { RentHistoryView } from '@/components/RentHistoryView';
import { AgreementReminder } from '@/components/AgreementReminder';
import { Tenant, RentEntry } from '@/types/tenant';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const Index = () => {
  const { toast } = useToast();
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showRentHistory, setShowRentHistory] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

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

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowAddTenant(true);
  };

  const handleUpdateTenant = (updatedTenantData: Omit<Tenant, 'id'>) => {
    if (editingTenant) {
      const updatedTenant: Tenant = {
        ...updatedTenantData,
        id: editingTenant.id,
      };
      const updatedTenants = tenants.map(t => 
        t.id === editingTenant.id ? updatedTenant : t
      );
      setTenants(updatedTenants);
      localStorage.setItem('tenants', JSON.stringify(updatedTenants));
      
      // Update selected tenant if it was the one being edited
      if (selectedTenant?.id === editingTenant.id) {
        setSelectedTenant(updatedTenant);
      }
      
      setEditingTenant(null);
      setShowAddTenant(false);
      
      toast({
        title: "Tenant Updated",
        description: `${updatedTenant.name} has been updated successfully`,
      });
    }
  };

  const handleDeleteTenant = (tenantId: string) => {
    const updatedTenants = tenants.filter(tenant => tenant.id !== tenantId);
    setTenants(updatedTenants);
    localStorage.setItem('tenants', JSON.stringify(updatedTenants));
    
    // Clear selected tenant if it was deleted
    if (selectedTenant?.id === tenantId) {
      setSelectedTenant(null);
    }

    // Also remove all rent entries for this tenant
    const savedEntries = localStorage.getItem('rentEntries');
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      const filteredEntries = entries.filter((entry: any) => entry.tenantId !== tenantId);
      localStorage.setItem('rentEntries', JSON.stringify(filteredEntries));
    }

    toast({
      title: "Tenant Deleted",
      description: "Tenant and all associated rent entries have been removed",
    });
  };

  const handleCloseAddTenantDialog = () => {
    setShowAddTenant(false);
    setEditingTenant(null);
  };

  const handleEditRentEntry = (entry: RentEntry) => {
    // Find the tenant for this entry and select them
    const tenant = tenants.find(t => t.id === entry.tenantId);
    if (tenant) {
      setSelectedTenant(tenant);
      setShowRentHistory(false);
      // The RentCalculator component will handle loading the entry for editing
    }
  };

  const exportTenantsToExcel = () => {
    if (tenants.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please add some tenants first",
        variant: "destructive"
      });
      return;
    }

    const exportData = tenants.map(tenant => ({
      'Tenant Name': tenant.name,
      'Monthly Rent': tenant.monthlyRent,
      'Electricity Rate': tenant.electricityRate,
      'Initial Electricity Reading': tenant.initialElectricityReading,
      'Agreement Start Date': tenant.agreementStartDate || '',
      'Agreement Duration (months)': tenant.agreementDuration || 11
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tenants');

    // Auto-width columns
    worksheet['!cols'] = Array(6).fill({wch: 20});

    const fileName = `tenants-list-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Excel Export Complete",
      description: `Exported ${tenants.length} tenants to ${fileName}`,
    });
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Watermark at the bottom */}
      <div className="fixed inset-x-0 bottom-0 flex items-end justify-center pointer-events-none z-0 pb-4">
        <div className="flex flex-col items-center">
          <p className="text-accent/10 text-lg font-normal select-none mb-1">
            Powered by
          </p>
          <p className="text-accent/10 text-4xl font-bold select-none">
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
          {/* Agreement Reminders */}
          <AgreementReminder tenants={tenants} />

          <TenantSelector 
            tenants={tenants} 
            selectedTenant={selectedTenant}
            onSelectTenant={setSelectedTenant}
            onDeleteTenant={handleDeleteTenant}
            onEditTenant={handleEditTenant}
          />

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => setShowAddTenant(true)}
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Tenant
            </Button>

            <Button
              onClick={() => setShowRentHistory(true)}
              className="bg-success hover:bg-success/90 shadow-lg shadow-success/25"
            >
              <List className="w-5 h-5 mr-2" />
              View All Entries
            </Button>

            {tenants.length > 0 && (
              <Button
                onClick={exportTenantsToExcel}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Download className="w-5 h-5 mr-2" />
                Export Tenants
              </Button>
            )}
          </div>

          {selectedTenant && (
            <RentCalculator tenant={selectedTenant} />
          )}
        </div>

        <AddTenantDialog
          open={showAddTenant}
          onClose={handleCloseAddTenantDialog}
          onAddTenant={editingTenant ? handleUpdateTenant : handleAddTenant}
          editingTenant={editingTenant}
        />

        {showRentHistory && (
          <RentHistoryView
            tenants={tenants}
            onClose={() => setShowRentHistory(false)}
            onEditRentEntry={handleEditRentEntry}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
