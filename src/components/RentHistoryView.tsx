import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Trash2, Edit } from 'lucide-react';
import { RentEntry, Tenant } from '@/types/tenant';
import { useToast } from '@/hooks/use-toast';

interface RentHistoryViewProps {
  tenants: Tenant[];
  onClose: () => void;
  onEditRentEntry?: (entry: RentEntry) => void;
}

export const RentHistoryView = ({ tenants, onClose, onEditRentEntry }: RentHistoryViewProps) => {
  const { toast } = useToast();
  const [rentEntries, setRentEntries] = useState<RentEntry[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<RentEntry | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | 'partial'>('unpaid');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

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

  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = rentEntries.filter(entry => entry.id !== entryId);
    setRentEntries(updatedEntries);
    localStorage.setItem('rentEntries', JSON.stringify(updatedEntries));
    
    toast({
      title: "Entry Deleted",
      description: "Rent entry has been deleted successfully",
    });
  };

  const handleEditEntry = (entry: RentEntry) => {
    setEditingEntry(entry);
    setPaymentStatus(entry.paymentStatus || 'unpaid');
    setPaymentDate(entry.paymentDate || '');
    setPaymentNotes(entry.paymentNotes || '');
    setAmountPaid(entry.amountPaid?.toString() || '');
  };

  const handleSavePaymentInfo = () => {
    if (!editingEntry) return;

    const paidAmount = parseFloat(amountPaid) || 0;
    const totalWithBalance = editingEntry.totalRent + (editingEntry.previousBalance || 0) - (editingEntry.advanceCredit || 0);
    const finalAmountDue = Math.max(0, totalWithBalance);
    let newPaymentStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';
    let balance = 0;
    let advanceCredit = 0;

    if (paidAmount >= finalAmountDue) {
      newPaymentStatus = 'paid';
      balance = 0;
      // If paid more than due, create advance credit
      if (paidAmount > finalAmountDue) {
        advanceCredit = paidAmount - finalAmountDue;
      }
    } else if (paidAmount > 0) {
      newPaymentStatus = 'partial';
      balance = finalAmountDue - paidAmount;
    } else {
      newPaymentStatus = 'unpaid';
      balance = finalAmountDue;
    }

    const updatedEntry = {
      ...editingEntry,
      paymentStatus: newPaymentStatus,
      paymentDate: paymentDate || undefined,
      paymentNotes: paymentNotes || undefined,
      amountPaid: paidAmount || undefined,
      balance: balance || undefined,
      advanceCredit: advanceCredit || undefined,
    };

    const updatedEntries = rentEntries.map(entry => 
      entry.id === editingEntry.id ? updatedEntry : entry
    );

    setRentEntries(updatedEntries);
    localStorage.setItem('rentEntries', JSON.stringify(updatedEntries));
    
    setEditingEntry(null);
    setPaymentStatus('unpaid');
    setPaymentDate('');
    setPaymentNotes('');
    setAmountPaid('');

    toast({
      title: "Payment Info Updated",
      description: `Payment information updated. ${balance > 0 ? `Balance: ₹${balance.toFixed(2)}` : advanceCredit > 0 ? `Advance Credit: ₹${advanceCredit.toFixed(2)}` : 'Fully paid'}`,
    });
  };

  const handleEditLatestEntry = () => {
    if (selectedTenantId !== 'all' && filteredEntries.length > 0) {
      const latestEntry = filteredEntries[0];
      handleEditEntry(latestEntry);
    }
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
            
            {selectedTenantId !== 'all' && filteredEntries.length > 0 && (
              <Button
                onClick={handleEditLatestEntry}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Payment Status
              </Button>
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
                  <TableHead className="text-muted-foreground">Previous Balance</TableHead>
                  <TableHead className="text-muted-foreground">Advance Credit</TableHead>
                  <TableHead className="text-muted-foreground">Total Rent</TableHead>
                  <TableHead className="text-muted-foreground">Amount Paid</TableHead>
                  <TableHead className="text-muted-foreground">Balance</TableHead>
                  <TableHead className="text-muted-foreground">Payment Status</TableHead>
                  <TableHead className="text-muted-foreground">Payment Date</TableHead>
                  <TableHead className="text-muted-foreground">Payment Notes</TableHead>
                  <TableHead className="text-muted-foreground">Date Created</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow 
                    key={entry.id} 
                    className="border-border hover:bg-accent/10"
                  >
                    <TableCell className="text-foreground font-medium">
                      {getTenantName(entry.tenantId)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{entry.month}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.year}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.previousReading}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.currentReading}</TableCell>
                    <TableCell className="text-muted-foreground">₹{entry.additionalCharges}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.previousBalance ? `₹${entry.previousBalance.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.advanceCredit ? `₹${entry.advanceCredit.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-accent font-semibold">₹{entry.totalRent.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.amountPaid ? `₹${entry.amountPaid.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.balance ? `₹${entry.balance.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.paymentStatus === 'paid' 
                          ? 'bg-success/20 text-success' 
                          : entry.paymentStatus === 'partial'
                          ? 'bg-yellow-500/20 text-yellow-400'
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
                    <TableCell>
                      <Button
                        onClick={() => handleDeleteEntry(entry.id)}
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Edit Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Payment Information</DialogTitle>
          </DialogHeader>
          
          {editingEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <strong>Tenant:</strong> {getTenantName(editingEntry.tenantId)}
                </div>
                <div>
                  <strong>Month:</strong> {editingEntry.month} {editingEntry.year}
                </div>
                <div>
                  <strong>Total Rent:</strong> ₹{editingEntry.totalRent.toFixed(2)}
                </div>
                <div>
                  <strong>Previous Balance:</strong> ₹{(editingEntry.previousBalance || 0).toFixed(2)}
                </div>
                <div>
                  <strong>Advance Credit:</strong> ₹{(editingEntry.advanceCredit || 0).toFixed(2)}
                </div>
                <div className="col-span-1">
                  <strong>Final Amount Due:</strong> ₹{Math.max(0, editingEntry.totalRent + (editingEntry.previousBalance || 0) - (editingEntry.advanceCredit || 0)).toFixed(2)}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount-paid" className="text-foreground">Amount Paid (₹)</Label>
                  <Input
                    id="amount-paid"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Enter amount paid"
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="payment-date" className="text-foreground">Payment Date</Label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="payment-notes" className="text-foreground">Payment Notes (Optional)</Label>
                  <Textarea
                    id="payment-notes"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Enter any notes about the payment..."
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setEditingEntry(null)}
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePaymentInfo}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
