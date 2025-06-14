
export interface Tenant {
  id: string;
  name: string;
  monthlyRent: number;
  electricityRate: number;
  initialElectricityReading: number;
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
  paymentStatus?: 'paid' | 'unpaid';
  paymentDate?: string;
  paymentNotes?: string;
}
