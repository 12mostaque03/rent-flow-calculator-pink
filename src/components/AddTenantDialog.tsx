
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tenant } from '@/types/tenant';

interface AddTenantDialogProps {
  open: boolean;
  onClose: () => void;
  onAddTenant: (tenant: Omit<Tenant, 'id'>) => void;
  editingTenant?: Tenant | null;
}

export const AddTenantDialog = ({ open, onClose, onAddTenant, editingTenant }: AddTenantDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    monthlyRent: '',
    electricityRate: '',
    initialElectricityReading: '',
    agreementStartDate: '',
    agreementDuration: '11',
  });

  useEffect(() => {
    if (editingTenant) {
      setFormData({
        name: editingTenant.name,
        monthlyRent: editingTenant.monthlyRent.toString(),
        electricityRate: editingTenant.electricityRate.toString(),
        initialElectricityReading: editingTenant.initialElectricityReading.toString(),
        agreementStartDate: editingTenant.agreementStartDate || '',
        agreementDuration: (editingTenant.agreementDuration || 11).toString(),
      });
    } else {
      setFormData({
        name: '',
        monthlyRent: '',
        electricityRate: '',
        initialElectricityReading: '',
        agreementStartDate: '',
        agreementDuration: '11',
      });
    }
  }, [editingTenant, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tenantData = {
      name: formData.name,
      monthlyRent: parseFloat(formData.monthlyRent),
      electricityRate: parseFloat(formData.electricityRate),
      initialElectricityReading: parseFloat(formData.initialElectricityReading),
      agreementStartDate: formData.agreementStartDate || undefined,
      agreementDuration: parseInt(formData.agreementDuration),
    };
    
    onAddTenant(tenantData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTenant ? 'Edit Tenant' : 'Add New Tenant'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tenant Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="monthlyRent">Monthly Rent (₹)</Label>
            <Input
              id="monthlyRent"
              type="number"
              value={formData.monthlyRent}
              onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="electricityRate">Electricity Rate (₹ per unit)</Label>
            <Input
              id="electricityRate"
              type="number"
              step="0.01"
              value={formData.electricityRate}
              onChange={(e) => setFormData({ ...formData, electricityRate: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="initialReading">Initial Electricity Reading</Label>
            <Input
              id="initialReading"
              type="number"
              value={formData.initialElectricityReading}
              onChange={(e) => setFormData({ ...formData, initialElectricityReading: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="agreementStartDate">Agreement Start Date</Label>
            <Input
              id="agreementStartDate"
              type="date"
              value={formData.agreementStartDate}
              onChange={(e) => setFormData({ ...formData, agreementStartDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="agreementDuration">Agreement Duration (months)</Label>
            <Input
              id="agreementDuration"
              type="number"
              value={formData.agreementDuration}
              onChange={(e) => setFormData({ ...formData, agreementDuration: e.target.value })}
              min="1"
              max="24"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTenant ? 'Update' : 'Add'} Tenant
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
