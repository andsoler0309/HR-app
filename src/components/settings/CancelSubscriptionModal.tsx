"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCancelled: () => void;
}

const CANCELLATION_REASONS = [
  "too_expensive",
  "not_using_it_enough",
  "missing_features",
  "found_another_solution",
  "technical_issues",
  "other",
];

export default function CancelSubscriptionModal({
  isOpen,
  onClose,
  onCancelled,
}: Props) {
  const t = useTranslations("CancelSubscriptionModal");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Update profiles with free plan
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          subscription_status: "free",
          subscription_end_date: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update subscription
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason === "Other" ? otherReason : reason,
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("status", "active");

      if (updateError) throw updateError;

      onCancelled();
      onClose();
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      setError(t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl p-8 w-full max-w-md border border-card-border shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">{t("title")}</h2>

        {error && (
          <div className="mb-4 p-4 bg-error/10 text-error rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-base font-medium mb-2">
              {t("whyCancelling")}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-base px-4 py-3 text-base"
            >
              <option value="">{t("selectReason")}</option>
              {CANCELLATION_REASONS.map((reasonKey) => (
                <option key={reasonKey} value={reasonKey}>
                  {t(`reasons.${reasonKey}`)}
                </option>
              ))}
            </select>
          </div>

          {reason === "Other" && (
            <div>
              <label className="block text-md mb-2">{t("otherSpecify")}</label>
              <textarea
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="textarea-base w-full h-24 resize-none px-4 py-3 text-sm text-black rounded-md"
                placeholder={t("placeholderSpecify")}
              />
            </div>
          )}

          <div className="mt-6 p-4 bg-warning/10 rounded-lg text-sm">
            <p className="font-medium text-warning mb-2">
              {t("importantNote")}
            </p>
            <ul className="list-disc space-y-1 text-muted p-2">
              <li>{t("noteList.activeUntilEnd")}</li>
              <li>{t("noteList.accessPremium")}</li>
              <li>{t("noteList.noRefunds")}</li>
              <li>{t("noteList.reactivateAnytime")}</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-6 py-3 text-base disabled:opacity-50 rounded-lg"
              disabled={isLoading}
            >
              {t("keepSubscription")}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-red-700 px-6 py-3 text-base disabled:opacity-50 rounded-lg"
              disabled={
                isLoading || !reason || (reason === "Other" && !otherReason)
              }
            >
              {isLoading ? t("cancelling") : t("confirmCancellation")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
