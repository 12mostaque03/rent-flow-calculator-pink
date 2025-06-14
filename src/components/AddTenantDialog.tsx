
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tenant } from '@/types/tenant';

interface AddTenantDialogProps {
  open: boolean;
  onClose: () => void;
  onAddTenant: (tenant: Omit<Tenant, 'id'>) => void;
}

export const AddTenantDialog = ({ open, onClose, onAddTenant }: AddTenantDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    monthlyRent: '',
    electricityRate: '',
    initialElectricityReading: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.monthlyRent || !formData.electricityRate || !formData.initialElectricityReading) {
      return;
    }

    onAddTenant({
      name: formData.name,
      monthlyRent: parseFloat(formData.monthlyRent),
      electricityRate: parseFloat(formData.electricityRate),
      initialElectricityReading: parseFloat(formData.initialElectricityReading),
    });

    setFormData({
      name: '',
      monthlyRent: '',
      electricityRate: '',
      initialElectricityReading: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-pink-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Add New <span className="text-pink-400">Tenant</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300">Tenant Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter tenant name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="monthlyRent" className="text-gray-300">Monthly Room Rent (₹)</Label>
            <Input
              id="monthlyRent"
              type="number"
              value={formData.monthlyRent}
              onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter monthly rent"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="electricityRate" className="text-gray-300">Electricity Unit Rate (₹/unit)</Label>
            <Input
              id="electricityRate"
              type="number"
              step="0.01"
              value={formData.electricityRate}
              onChange={(e) => setFormData({ ...formData, electricityRate: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter rate per unit"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="initialReading" className="text-gray-300">Initial Electricity Reading</Label>
            <Input
              id="initialReading"
              type="number"
              value={formData.initialElectricityReading}
              onChange={(e) => setFormData({ ...formData, initialElectricityReading: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Enter initial reading"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
            >
              Add Tenant
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
