
export type BillingStats = {
  total: number;
  monthly: number;
  percentage: number;
  activeCount: number;
  overdueCount: number;
};

export type BillingData = {
  id: string;
  name: string;
  billing_plan: string;
  billing_amount: number;
  billing_status: string;
  last_payment_date: string | null;
  city: string | null;
  monthly_sales?: number;
};
