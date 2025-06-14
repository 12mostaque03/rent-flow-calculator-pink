
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Edit, Check, Calendar } from 'lucide-react';
import { RentEntry, Tenant } from '@/types/tenant';
import { useToast } from '@/hooks/use-toast';

interface RentHistoryViewProps {
  tenants: Tenant[];
  onClose: () => void;
}

export const RentHistoryView = ({ tenants, onClose }: RentHistoryViewProps) => {
  const { toast } = useToast();
  const [rentEntries, setRentEntries] = useState<RentEntry[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    paymentDate: '',
    paymentNotes: '',
    paymentStatus: 'unpaid' as 'paid' | 'unpaid'
  });

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

  const handleEditPayment = (entry: RentEntry) => {
    setEditingEntry(entry.id);
    setEditData({
      paymentDate: entry.paymentDate || '',
      paymentNotes: entry.paymentNotes || '',
      paymentStatus: entry.paymentStatus || 'unpaid'
    });
  };

  const handleSavePayment = (entryId: string) => {
    const updatedEntries = rentEntries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          paymentStatus: editData.paymentStatus,
          paymentDate: editData.paymentDate,
          paymentNotes: editData.paymentNotes
        };
      }
      return entry;
    });

    setRentEntries(updatedEntries);
    localStorage.setItem('rentEntries', JSON.stringify(updatedEntries));
    setEditingEntry(null);
    
    toast({
      title: "Payment Updated",
      description: "Payment information has been saved successfully",
    });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditData({
      paymentDate: '',
      paymentNotes: '',
      paymentStatus: 'unpaid'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-800/95 backdrop-blur-lg border-blue-500/20 w-full max-w-7xl max-h-[90vh] overflow-hidden">
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
                  <TableHead className="text-gray-300">Payment Status</TableHead>
                  <TableHead className="text-gray-300">Payment Date</TableHead>
                  <TableHead className="text-gray-300">Payment Notes</TableHead>
                  <TableHead className="text-gray-300">Date Created</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
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
                    <TableCell>
                      {editingEntry === entry.id ? (
                        <Select 
                          value={editData.paymentStatus} 
                          onValueChange={(value) => setEditData({...editData, paymentStatus: value as 'paid' | 'unpaid'})}
                        >
                          <SelectTrigger className="w-24 bg-gray-700 border-gray-600 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="paid" className="text-green-400 hover:bg-gray-600">Paid</SelectItem>
                            <SelectItem value="unpaid" className="text-red-400 hover:bg-gray-600">Unpaid</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.paymentStatus === 'paid' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {entry.paymentStatus || 'Unpaid'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingEntry === entry.id ? (
                        <Input
                          type="date"
                          value={editData.paymentDate}
                          onChange={(e) => setEditData({...editData, paymentDate: e.target.value})}
                          className="w-36 bg-gray-700 border-gray-600 text-white text-xs"
                        />
                      ) : (
                        <span className="text-gray-300 text-xs">
                          {entry.paymentDate ? new Date(entry.paymentDate).toLocaleDateString() : '-'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-32">
                      {editingEntry === entry.id ? (
                        <Textarea
                          value={editData.paymentNotes}
                          onChange={(e) => setEditData({...editData, paymentNotes: e.target.value})}
                          placeholder="Payment notes..."
                          className="w-32 h-16 bg-gray-700 border-gray-600 text-white text-xs resize-none"
                        />
                      ) : (
                        <span className="text-gray-300 text-xs break-words">
                          {entry.paymentNotes || '-'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300 text-xs">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {editingEntry === entry.id ? (
                        <div className="flex gap-1">
                          <Button
                            onClick={() => handleSavePayment(entry.id)}
                            size="icon"
                            className="w-6 h-6 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6 text-gray-400 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleEditPayment(entry)}
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6 text-gray-400 hover:text-blue-400"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
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
