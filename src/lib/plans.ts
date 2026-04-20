export interface PricingPlan {
  id: 'starter' | 'complete';
  name: string;
  price: number;
  cta: string;
  highlighted: boolean;
  note: string;
  features: Array<{
    label: string;
    included: boolean;
  }>;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    note: 'per month. Focused prep for your next interview sprint.',
    cta: 'Start Preparing',
    highlighted: false,
    features: [
      { label: 'ATS score checks and resume guidance', included: true },
      { label: 'Interview prep modules', included: true },
      { label: 'Roadmap planning essentials', included: true },
      { label: 'Priority AI coaching', included: false },
    ],
  },
  {
    id: 'complete',
    name: 'Complete',
    price: 499,
    note: 'per month. Full career workspace for serious placement prep.',
    cta: 'Unlock TUCF',
    highlighted: true,
    features: [
      { label: 'Everything in Starter', included: true },
      { label: 'Portfolio and cover letter workflows', included: true },
      { label: 'Priority AI coaching and job search support', included: true },
      { label: 'Early access to new TUCF tools', included: true },
    ],
  },
];

export const getPricingPlan = (planId: string | null) =>
  pricingPlans.find((plan) => plan.id === planId) ?? pricingPlans[0];
