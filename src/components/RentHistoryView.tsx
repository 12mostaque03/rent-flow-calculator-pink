
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Edit, CheckCircle } from 'lucide-react';
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
  const [markingBalancePaid, setMarkingBalancePaid] = useState<RentEntry | null>(null);
  const [balancePaidDate, setBalancePaidDate] = useState('');

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

  const handleEditEntry = (entry: RentEntry) => {
    setEditingEntry(entry);
    setPaymentStatus(entry.paymentStatus || 'unpaid');
    setPaymentDate(entry.paymentDate || '');
    setPaymentNotes(entry.paymentNotes || '');
    setAmountPaid(entry.amountPaid?.toString() || '');
  };

  const handleMarkBalancePaid = (entry: RentEntry) => {
    setMarkingBalancePaid(entry);
    setBalancePaidDate('');
  };

  const handleSaveBalancePaid = () => {
    if (!markingBalancePaid || !balancePaidDate) return;

    const updatedEntry = {
      ...markingBalancePaid,
      isBalancePaid: true,
      balancePaidDate: balancePaidDate,
      paymentStatus: 'paid' as const,
      balance: 0,
    };

    const updatedEntries = rentEntries.map(entry => 
      entry.id === markingBalancePaid.id ? updatedEntry : entry
    );

    setRentEntries(updatedEntries);
    localStorage.setItem('rentEntries', JSON.stringify(updatedEntries));
    
    setMarkingBalancePaid(null);
    setBalancePaidDate('');

    toast({
      title: "Balance Marked as Paid",
      description: `Remaining balance of ₹${markingBalancePaid.balance?.toFixed(2)} marked as paid on ${new Date(balancePaidDate).toLocaleDateString()}`,
    });
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
                Edit Latest Payment
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
            <div className="grid gap-4">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="border-border hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {getTenantName(entry.tenantId)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {entry.month} {entry.year} • Created: {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          entry.paymentStatus === 'paid' 
                            ? 'bg-success/20 text-success' 
                            : entry.paymentStatus === 'partial'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-destructive/20 text-destructive'
                        }`}>
                          {entry.paymentStatus || 'Unpaid'}
                        </span>
                        <Button
                          onClick={() => handleEditEntry(entry)}
                          size="sm"
                          variant="outline"
                          className="text-primary border-primary hover:bg-primary/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {entry.balance && entry.balance > 0 && !entry.isBalancePaid && (
                          <Button
                            onClick={() => handleMarkBalancePaid(entry)}
                            size="sm"
                            variant="outline"
                            className="text-success border-success hover:bg-success/10"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Electricity Reading:</span>
                        <p className="text-foreground font-medium">
                          {entry.previousReading} → {entry.currentReading}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Additional Charges:</span>
                        <p className="text-foreground font-medium">₹{entry.additionalCharges}</p>
                      </div>
                      
                      {entry.previousBalance && entry.previousBalance > 0 && (
                        <div>
                          <span className="text-muted-foreground">Previous Balance:</span>
                          <p className="text-destructive font-medium">₹{entry.previousBalance.toFixed(2)}</p>
                        </div>
                      )}
                      
                      {entry.advanceCredit && entry.advanceCredit > 0 && (
                        <div>
                          <span className="text-muted-foreground">Advance Credit:</span>
                          <p className="text-success font-medium">₹{entry.advanceCredit.toFixed(2)}</p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-muted-foreground">Total Rent:</span>
                        <p className="text-accent font-bold text-lg">₹{entry.totalRent.toFixed(2)}</p>
                      </div>
                      
                      {entry.amountPaid && (
                        <div>
                          <span className="text-muted-foreground">Amount Paid:</span>
                          <p className="text-success font-medium">₹{entry.amountPaid.toFixed(2)}</p>
                        </div>
                      )}
                      
                      {entry.balance && entry.balance > 0 && (
                        <div>
                          <span className="text-muted-foreground">Outstanding Balance:</span>
                          <p className={`font-medium ${entry.isBalancePaid ? 'text-success' : 'text-destructive'}`}>
                            ₹{entry.balance.toFixed(2)}
                            {entry.isBalancePaid && ' (Paid)'}
                          </p>
                        </div>
                      )}
                      
                      {entry.paymentDate && (
                        <div>
                          <span className="text-muted-foreground">Payment Date:</span>
                          <p className="text-foreground font-medium">
                            {new Date(entry.paymentDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {entry.balancePaidDate && (
                        <div>
                          <span className="text-muted-foreground">Balance Paid Date:</span>
                          <p className="text-success font-medium">
                            {new Date(entry.balancePaidDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {entry.paymentNotes && (
                      <div className="mt-3 p-2 bg-muted/20 rounded">
                        <span className="text-muted-foreground text-sm">Notes:</span>
                        <p className="text-foreground text-sm mt-1">{entry.paymentNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
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

      {/* Mark Balance as Paid Dialog */}
      <Dialog open={!!markingBalancePaid} onOpenChange={() => setMarkingBalancePaid(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Mark Balance as Paid</DialogTitle>
          </DialogHeader>
          
          {markingBalancePaid && (
            <div className="space-y-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <p className="text-foreground mb-2">
                  <strong>Tenant:</strong> {getTenantName(markingBalancePaid.tenantId)}
                </p>
                <p className="text-foreground mb-2">
                  <strong>Month:</strong> {markingBalancePaid.month} {markingBalancePaid.year}
                </p>
                <p className="text-destructive text-lg font-bold">
                  <strong>Outstanding Balance:</strong> ₹{markingBalancePaid.balance?.toFixed(2)}
                </p>
              </div>

              <div>
                <Label htmlFor="balance-paid-date" className="text-foreground">Date When Balance Was Paid</Label>
                <Input
                  id="balance-paid-date"
                  type="date"
                  value={balancePaidDate}
                  onChange={(e) => setBalancePaidDate(e.target.value)}
                  className="bg-input border-border text-foreground"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setMarkingBalancePaid(null)}
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveBalancePaid}
                  className="bg-success text-white hover:bg-success/90"
                  disabled={!balancePaidDate}
                >
                  Mark as Paid
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
