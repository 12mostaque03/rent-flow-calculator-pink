
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
  const [previousBalance, setPreviousBalance] = useState(0);
  const [advanceCredit, setAdvanceCredit] = useState(0);
  const [carriedFromMonth, setCarriedFromMonth] = useState<string>(''); // Track which month the balance came from

  const getNextMonth = (currentMonth: string, currentYear: string) => {
    const monthIndex = months.indexOf(currentMonth);
    if (monthIndex === 11) { // December
      return {
        month: months[0], // January
        year: (parseInt(currentYear) + 1).toString()
      };
    } else {
      return {
        month: months[monthIndex + 1],
        year: currentYear
      };
    }
  };

  useEffect(() => {
    console.log('Loading previous entries for tenant:', tenant.id);
    const savedEntries = localStorage.getItem('rentEntries');
    if (savedEntries) {
      const entries: RentEntry[] = JSON.parse(savedEntries);
      const tenantEntries = entries
        .filter(entry => entry.tenantId === tenant.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log('Found tenant entries:', tenantEntries.length);
      
      if (tenantEntries.length > 0) {
        console.log('Setting previous reading to:', tenantEntries[0].currentReading);
        const lastEntry = tenantEntries[0];
        const nextMonth = getNextMonth(lastEntry.month, lastEntry.year.toString());
        
        // Set previous balance and advance credit from the last entry, but only if balance hasn't been paid
        const balanceToCarry = (lastEntry.balance && !lastEntry.isBalancePaid) ? lastEntry.balance : 0;
        setPreviousBalance(balanceToCarry);
        setAdvanceCredit(lastEntry.advanceCredit || 0);
        
        // Track which month the balance came from
        if (balanceToCarry > 0) {
          setCarriedFromMonth(`${lastEntry.month} ${lastEntry.year}`);
        } else {
          setCarriedFromMonth('');
        }
        
        setFormData(prev => ({
          ...prev,
          previousReading: lastEntry.currentReading.toString(),
          month: nextMonth.month,
          year: nextMonth.year,
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
    console.log('Save button clicked');
    console.log('Form data:', formData);
    console.log('Total rent:', totalRent);

    if (!formData.month || !formData.currentReading) {
      console.log('Missing required fields - month:', formData.month, 'currentReading:', formData.currentReading);
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
      console.log('Invalid reading - current:', current, 'previous:', previous);
      toast({
        title: "Invalid Reading",
        description: "Current reading cannot be less than previous reading",
        variant: "destructive",
      });
      return;
    }

    // Calculate the final amount due after applying advance credit
    const totalDue = totalRent + previousBalance - advanceCredit;
    const finalAmountDue = Math.max(0, totalDue); // Can't be negative

    const newEntry: RentEntry = {
      id: Date.now().toString(),
      tenantId: tenant.id,
      month: formData.month,
      year: parseInt(formData.year),
      previousReading: previous,
      currentReading: current,
      additionalCharges: parseFloat(formData.additionalCharges) || 0,
      totalRent,
      previousBalance,
      advanceCredit,
      balance: finalAmountDue, // Initial balance is final amount due
      createdAt: new Date().toISOString(),
    };

    console.log('Creating new entry:', newEntry);

    const savedEntries = localStorage.getItem('rentEntries');
    const entries: RentEntry[] = savedEntries ? JSON.parse(savedEntries) : [];
    entries.push(newEntry);
    
    console.log('Saving entries to localStorage:', entries);
    localStorage.setItem('rentEntries', JSON.stringify(entries));

    const verifyEntries = localStorage.getItem('rentEntries');
    console.log('Verified saved entries:', verifyEntries ? JSON.parse(verifyEntries) : null);

    let toastMessage = `Total rent for ${formData.month} ${formData.year}: ₹${finalAmountDue.toFixed(2)}`;
    if (advanceCredit > 0) {
      toastMessage += ` (₹${advanceCredit.toFixed(2)} advance credit applied)`;
    }
    if (previousBalance > 0) {
      toastMessage += ` (₹${previousBalance.toFixed(2)} added from ${carriedFromMonth})`;
    }

    toast({
      title: "Rent Saved Successfully",
      description: toastMessage,
    });

    const nextMonth = getNextMonth(formData.month, formData.year);
    setFormData({
      month: nextMonth.month,
      year: nextMonth.year,
      previousReading: current.toString(),
      currentReading: '',
      additionalCharges: '0',
    });
    setPreviousBalance(0);
    setAdvanceCredit(0); // Reset for next entry
    setCarriedFromMonth('');

    console.log('Form reset completed with next month:', nextMonth);
  };

  // Calculate final amount due after applying advance credit
  const finalAmountDue = Math.max(0, totalRent + previousBalance - advanceCredit);

  return (
    <Card className="bg-gray-800/50 backdrop-blur-lg border-blue-500/20 p-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        Calculate Rent for <span className="text-blue-400">{tenant.name}</span>
      </h2>

      {previousBalance > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-400 font-semibold mb-2">Previous Balance Due</h3>
          <p className="text-white">
            ₹{previousBalance.toFixed(2)} from <span className="font-semibold text-yellow-300">{carriedFromMonth}</span> will be added to this month's rent.
          </p>
          <p className="text-yellow-200 text-sm mt-1">
            This amount was carried forward because it wasn't fully paid in {carriedFromMonth}.
          </p>
        </div>
      )}

      {advanceCredit > 0 && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-green-400 font-semibold mb-2">Advance Credit Available</h3>
          <p className="text-white">₹{advanceCredit.toFixed(2)} advance payment will be applied to this month's rent.</p>
        </div>
      )}

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
          {previousBalance > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-300">Previous Balance (from {carriedFromMonth}):</span>
              <span className="text-yellow-400">₹{previousBalance.toFixed(2)}</span>
            </div>
          )}
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
            <span className="text-blue-400">Total This Month:</span>
            <span className="text-blue-400 text-lg">₹{totalRent.toFixed(2)}</span>
          </div>
          {advanceCredit > 0 && (
            <div className="flex justify-between">
              <span className="text-green-400">Advance Credit Applied:</span>
              <span className="text-green-400">-₹{advanceCredit.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span className="text-yellow-400">Final Amount Due:</span>
            <span className="text-yellow-400">₹{finalAmountDue.toFixed(2)}</span>
          </div>
          {previousBalance > 0 && (
            <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-700/50 rounded">
              <strong>Note:</strong> ₹{previousBalance.toFixed(2)} was added from {carriedFromMonth} because the balance wasn't fully paid that month.
            </div>
          )}
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
