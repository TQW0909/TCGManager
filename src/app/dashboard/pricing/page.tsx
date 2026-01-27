import { PricingCalculator } from "@/components/pricing/pricing-calculator";

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-50">Pricing</h2>
        <p className="text-sm text-slate-300">
          Quick calculator for Whatnot pricing: fees + shipping + target profit.
        </p>
      </div>

      <PricingCalculator />
    </div>
  );
}
