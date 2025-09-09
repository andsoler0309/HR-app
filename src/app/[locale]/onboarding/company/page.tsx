"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";

export default function CompanyOnboardingPage() {
  const t = useTranslations("companyOnboarding");
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    industry: "",
    size: "",
    country: "",
    logo: null as File | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (name === "logo" && files?.length) {
      setForm((prev) => ({ ...prev, logo: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");
      // Upload logo if present
      let logoUrl = null;
      if (form.logo) {
        const { data, error: uploadError } = await supabase.storage
          .from("company-logos")
          .upload(`logos/${user.id}_${Date.now()}`, form.logo);
        if (uploadError) throw uploadError;
        logoUrl = data?.path ? supabase.storage.from("company-logos").getPublicUrl(data.path).data.publicUrl : null;
      }
      // Insert company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: form.name,
          industry: form.industry,
          size: form.size,
          country: form.country,
          logo_url: logoUrl,
          owner_id: user.id,
        })
        .select()
        .single();
      if (companyError) throw companyError;
      // Update user profile with company_id
      await supabase.from("profiles").update({ company_id: company.id }).eq("id", user.id);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-16 sm:px-8 lg:px-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg bg-card py-10 px-8 shadow-md sm:rounded-xl border border-card-border">
        <h2 className="text-center text-3xl font-bold text-platinum mb-2">{t("title", { defaultValue: "Create your company" })}</h2>
        <p className="text-center text-base text-sunset mb-8">{t("subtitle", { defaultValue: "Tell us about your company to get started." })}</p>
        {error && <div className="mb-4 p-3 bg-error/10 rounded-lg border border-error/20 text-error text-center">{error}</div>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-base font-medium text-sunset mb-1">{t("companyName", { defaultValue: "Company Name" })} *</label>
            <input
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="input-base w-full py-3 text-base"
              placeholder={t("companyNamePlaceholder", { defaultValue: "e.g. Acme Inc." })}
            />
          </div>
          <div>
            <label className="block text-base font-medium text-sunset mb-1">{t("industry", { defaultValue: "Industry" })}</label>
            <input
              name="industry"
              type="text"
              value={form.industry}
              onChange={handleChange}
              className="input-base w-full py-3 text-base"
              placeholder={t("industryPlaceholder", { defaultValue: "e.g. Software" })}
            />
          </div>
          <div>
            <label className="block text-base font-medium text-sunset mb-1">{t("size", { defaultValue: "Company Size" })}</label>
            <input
              name="size"
              type="text"
              value={form.size}
              onChange={handleChange}
              className="input-base w-full py-3 text-base"
              placeholder={t("sizePlaceholder", { defaultValue: "e.g. 10-50" })}
            />
          </div>
          <div>
            <label className="block text-base font-medium text-sunset mb-1">{t("country", { defaultValue: "Country" })}</label>
            <input
              name="country"
              type="text"
              value={form.country}
              onChange={handleChange}
              className="input-base w-full py-3 text-base"
              placeholder={t("countryPlaceholder", { defaultValue: "e.g. Colombia" })}
            />
          </div>
          <div>
            <label className="block text-base font-medium text-sunset mb-1">{t("logo", { defaultValue: "Company Logo" })}</label>
            <input
              name="logo"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="block w-full text-base text-platinum mt-1"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center gap-3 py-3 px-4 rounded-lg shadow-sm text-base font-medium mt-4"
          >
            {loading ? t("creating", { defaultValue: "Creating..." }) : t("createCompany", { defaultValue: "Create Company" })}
          </button>
        </form>
      </div>
    </div>
  );
}
