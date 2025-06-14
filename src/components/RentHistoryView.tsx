
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
      <Card className="bg-card/95 backdrop-blur-lg border-border w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">All Rent Entries</CardTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[calc(90vh-120px)]">
          <div className="mb-4 flex gap-4 items-center">
            <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
              <SelectTrigger className="w-64 bg-input border-border text-foreground">
                <SelectValue placeholder="Filter by tenant..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-[60]">
                <SelectItem value="all" className="text-foreground hover:bg-accent/20">
                  All Tenants
                </SelectItem>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id} className="text-foreground hover:bg-accent/20">
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {editingEntry ? (
              <div className="flex gap-2 items-center">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <Select 
                      value={editData.paymentStatus} 
                      onValueChange={(value) => setEditData({...editData, paymentStatus: value as 'paid' | 'unpaid'})}
                    >
                      <SelectTrigger className="w-32 bg-input border-border text-foreground text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="paid" className="text-success hover:bg-accent/20">Paid</SelectItem>
                        <SelectItem value="unpaid" className="text-destructive hover:bg-accent/20">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={editData.paymentDate}
                      onChange={(e) => setEditData({...editData, paymentDate: e.target.value})}
                      className="w-40 bg-input border-border text-foreground text-sm"
                      placeholder="Payment date"
                    />
                  </div>
                  <Textarea
                    value={editData.paymentNotes}
                    onChange={(e) => setEditData({...editData, paymentNotes: e.target.value})}
                    placeholder="Payment notes..."
                    className="w-72 h-20 bg-input border-border text-foreground text-sm resize-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleSavePayment(editingEntry)}
                    size="sm"
                    className="bg-success hover:bg-success/90"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                Click on a row to edit payment information
              </div>
            )}
          </div>
          
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-lg">
                {selectedTenantId === 'all' 
                  ? 'No rent entries found' 
                  : `No rent entries found for ${getTenantName(selectedTenantId)}`
                }
              </p>
              <p className="text-muted-foreground/70 text-sm mt-2">Start calculating rent for your tenants to see entries here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Tenant</TableHead>
                  <TableHead className="text-muted-foreground">Month</TableHead>
                  <TableHead className="text-muted-foreground">Year</TableHead>
                  <TableHead className="text-muted-foreground">Previous Reading</TableHead>
                  <TableHead className="text-muted-foreground">Current Reading</TableHead>
                  <TableHead className="text-muted-foreground">Additional Charges</TableHead>
                  <TableHead className="text-muted-foreground">Total Rent</TableHead>
                  <TableHead className="text-muted-foreground">Payment Status</TableHead>
                  <TableHead className="text-muted-foreground">Payment Date</TableHead>
                  <TableHead className="text-muted-foreground">Payment Notes</TableHead>
                  <TableHead className="text-muted-foreground">Date Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow 
                    key={entry.id} 
                    className={`border-border cursor-pointer hover:bg-accent/10 ${
                      editingEntry === entry.id ? 'bg-primary/20' : ''
                    }`}
                    onClick={() => handleEditPayment(entry)}
                  >
                    <TableCell className="text-foreground font-medium">
                      {getTenantName(entry.tenantId)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{entry.month}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.year}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.previousReading}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.currentReading}</TableCell>
                    <TableCell className="text-muted-foreground">₹{entry.additionalCharges}</TableCell>
                    <TableCell className="text-accent font-semibold">₹{entry.totalRent.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.paymentStatus === 'paid' 
                          ? 'bg-success/20 text-success' 
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {entry.paymentStatus || 'Unpaid'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {entry.paymentDate ? new Date(entry.paymentDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-32 break-words">
                      {entry.paymentNotes || '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
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
