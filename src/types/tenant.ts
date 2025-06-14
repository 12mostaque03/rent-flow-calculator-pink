export interface Tenant {
  id: string;
  name: string;
  monthlyRent: number;
  electricityRate: number;
  initialElectricityReading: number;
  agreementStartDate?: string; // Date when agreement started
  agreementDuration?: number; // Duration in months (default 11)
}

export interface RentEntry {
  id: string;
  tenantId: string;
  month: string;
  year: number;
  previousReading: number;
  currentReading: number;
  additionalCharges: number;
  totalRent: number;
  createdAt: string;
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  paymentDate?: string;
  paymentNotes?: string;
  amountPaid?: number;
  balance?: number;
  previousBalance?: number;
  advanceCredit?: number; // Credit from overpayment to carry forward
  balancePaidDate?: string; // Date when remaining balance was paid
  isBalancePaid?: boolean; // Whether the remaining balance has been paid
}
