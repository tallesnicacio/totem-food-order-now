
import { useState, useEffect } from "react";
import { PricingPlans } from "@/components/subscription/PricingPlans";

const Subscription = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Planos e Assinaturas</h1>
      <PricingPlans />
    </div>
  );
};

export default Subscription;
