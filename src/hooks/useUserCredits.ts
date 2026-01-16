import { useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { useEffect } from "react";

export interface UserCredits {
  credits: number;
  promptWizardCredits: number;
}

export interface UserCreditsTotals {
  totalCredits: number;
  totalPromptWizardCredits: number;
}

export const useUserCredits = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<UserCredits>(
    "user-credits",
    async () => {
      const response = await axios.get("/api/user/credits");
      return response.data;
    },
    {
      refetchOnWindowFocus: true,
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );

  // Function to manually refetch credits (useful after payment)
  const refetchCredits = () => {
    queryClient.invalidateQueries("user-credits");
  };

  // Expose refetch function globally for payment success callbacks
  // CodeCanyon Requirement Note: This global is necessary for Stripe payment
  // callbacks that need to refresh user credits after successful payment.
  // The function is explicitly assigned to window object to maintain type safety.
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).refetchUserCredits = refetchCredits;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // refetchCredits is stable from react-query

  return {
    totals: {
      totalCredits: data?.credits ?? 0,
      totalPromptWizardCredits: data?.promptWizardCredits ?? 0,
    },
    credits: data?.credits ?? 0,
    promptWizardCredits: data?.promptWizardCredits ?? 0,
    isLoading,
    error,
    refetch: refetchCredits,
  };
};
