
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X } from 'lucide-react';
import { RentEntry, Tenant } from '@/types/tenant';

interface RentHistoryViewProps {
  tenants: Tenant[];
  onClose: () => void;
}

export const RentHistoryView = ({ tenants, onClose }: RentHistoryViewProps) => {
  const [rentEntries, setRentEntries] = useState<RentEntry[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('all');

  useEffect(() => {
    const savedEntries = localStorage.getItem('rentEntries');
    if (savedEntries) {
      const entries: RentEntry[] = JSON.parse(savedEntries);
      // Sort by creation date, newest first
      const sortedEntries = entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRentEntries(sortedEntries);
    }
  }, []);

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : 'Unknown Tenant';
  };

  const filteredEntries = selectedTenantId === 'all' 
    ? rentEntries 
    : rentEntries.filter(entry => entry.tenantId === selectedTenantId);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-800/95 backdrop-blur-lg border-blue-500/20 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">All Rent Entries</CardTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[calc(90vh-120px)]">
          <div className="mb-4">
            <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
              <SelectTrigger className="w-64 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filter by tenant..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 z-[60]">
                <SelectItem value="all" className="text-white hover:bg-gray-600">
                  All Tenants
                </SelectItem>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id} className="text-white hover:bg-gray-600">
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">
                {selectedTenantId === 'all' 
                  ? 'No rent entries found' 
                  : `No rent entries found for ${getTenantName(selectedTenantId)}`
                }
              </p>
              <p className="text-gray-500 text-sm mt-2">Start calculating rent for your tenants to see entries here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Tenant</TableHead>
                  <TableHead className="text-gray-300">Month</TableHead>
                  <TableHead className="text-gray-300">Year</TableHead>
                  <TableHead className="text-gray-300">Previous Reading</TableHead>
                  <TableHead className="text-gray-300">Current Reading</TableHead>
                  <TableHead className="text-gray-300">Additional Charges</TableHead>
                  <TableHead className="text-gray-300">Total Rent</TableHead>
                  <TableHead className="text-gray-300">Date Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="border-gray-600">
                    <TableCell className="text-white font-medium">
                      {getTenantName(entry.tenantId)}
                    </TableCell>
                    <TableCell className="text-gray-300">{entry.month}</TableCell>
                    <TableCell className="text-gray-300">{entry.year}</TableCell>
                    <TableCell className="text-gray-300">{entry.previousReading}</TableCell>
                    <TableCell className="text-gray-300">{entry.currentReading}</TableCell>
                    <TableCell className="text-gray-300">₹{entry.additionalCharges}</TableCell>
                    <TableCell className="text-blue-400 font-semibold">₹{entry.totalRent.toFixed(2)}</TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
