
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tenant, RentEntry } from '@/types/tenant';
import { useToast } from '@/hooks/use-toast';

interface RentCalculatorProps {
  tenant: Tenant;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const RentCalculator = ({ tenant }: RentCalculatorProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    previousReading: tenant.initialElectricityReading.toString(),
    currentReading: '',
    additionalCharges: '0',
  });

  const [totalRent, setTotalRent] = useState(0);

  useEffect(() => {
    // Load last entry for this tenant to get the previous reading
    const savedEntries = localStorage.getItem('rentEntries');
    if (savedEntries) {
      const entries: RentEntry[] = JSON.parse(savedEntries);
      const tenantEntries = entries
        .filter(entry => entry.tenantId === tenant.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      if (tenantEntries.length > 0) {
        setFormData(prev => ({
          ...prev,
          previousReading: tenantEntries[0].currentReading.toString(),
        }));
      }
    }
  }, [tenant.id]);

  useEffect(() => {
    // Calculate total rent whenever values change
    const previous = parseFloat(formData.previousReading) || 0;
    const current = parseFloat(formData.currentReading) || 0;
    const additional = parseFloat(formData.additionalCharges) || 0;
    
    if (current >= previous) {
      const electricityCharges = (current - previous) * tenant.electricityRate;
      const total = tenant.monthlyRent + electricityCharges + additional;
      setTotalRent(total);
    } else {
      setTotalRent(0);
    }
  }, [formData, tenant]);

  const handleSave = () => {
    if (!formData.month || !formData.currentReading) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const previous = parseFloat(formData.previousReading) || 0;
    const current = parseFloat(formData.currentReading) || 0;

    if (current < previous) {
      toast({
        title: "Invalid Reading",
        description: "Current reading cannot be less than previous reading",
        variant: "destructive",
      });
      return;
    }

    const newEntry: RentEntry = {
      id: Date.now().toString(),
      tenantId: tenant.id,
      month: formData.month,
      year: parseInt(formData.year),
      previousReading: previous,
      currentReading: current,
      additionalCharges: parseFloat(formData.additionalCharges) || 0,
      totalRent,
      createdAt: new Date().toISOString(),
    };

    const savedEntries = localStorage.getItem('rentEntries');
    const entries: RentEntry[] = savedEntries ? JSON.parse(savedEntries) : [];
    entries.push(newEntry);
    localStorage.setItem('rentEntries', JSON.stringify(entries));

    toast({
      title: "Rent Saved Successfully",
      description: `Total rent for ${formData.month} ${formData.year}: ₹${totalRent.toFixed(2)}`,
    });

    // Reset form for next month
    setFormData({
      month: '',
      year: new Date().getFullYear().toString(),
      previousReading: current.toString(),
      currentReading: '',
      additionalCharges: '0',
    });
  };

  return (
    <Card className="bg-gray-800/50 backdrop-blur-lg border-blue-500/20 p-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        Calculate Rent for <span className="text-blue-400">{tenant.name}</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="month" className="text-gray-300">Month</Label>
          <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {months.map((month) => (
                <SelectItem key={month} value={month} className="text-white hover:bg-gray-600">
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="year" className="text-gray-300">Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <div>
          <Label htmlFor="previousReading" className="text-gray-300">Previous Reading</Label>
          <Input
            id="previousReading"
            type="number"
            value={formData.previousReading}
            onChange={(e) => setFormData({ ...formData, previousReading: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            readOnly
          />
        </div>

        <div>
          <Label htmlFor="currentReading" className="text-gray-300">Current Reading</Label>
          <Input
            id="currentReading"
            type="number"
            value={formData.currentReading}
            onChange={(e) => setFormData({ ...formData, currentReading: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Enter current reading"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="additionalCharges" className="text-gray-300">Additional Charges (₹)</Label>
          <Input
            id="additionalCharges"
            type="number"
            value={formData.additionalCharges}
            onChange={(e) => setFormData({ ...formData, additionalCharges: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Maintenance, advance, etc."
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 mb-6 border border-blue-500/30">
        <h3 className="text-lg font-semibold text-white mb-2">Rent Breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Room Rent:</span>
            <span className="text-white">₹{tenant.monthlyRent}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Electricity ({(parseFloat(formData.currentReading) || 0) - (parseFloat(formData.previousReading) || 0)} units × ₹{tenant.electricityRate}):</span>
            <span className="text-white">₹{((parseFloat(formData.currentReading) || 0) - (parseFloat(formData.previousReading) || 0)) * tenant.electricityRate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Additional Charges:</span>
            <span className="text-white">₹{formData.additionalCharges || 0}</span>
          </div>
          <div className="border-t border-gray-600 pt-2 flex justify-between font-semibold">
            <span className="text-blue-400">Total Rent:</span>
            <span className="text-blue-400 text-lg">₹{totalRent.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        disabled={!formData.month || !formData.currentReading}
      >
        Save Rent Entry
      </Button>
    </Card>
  );
};
