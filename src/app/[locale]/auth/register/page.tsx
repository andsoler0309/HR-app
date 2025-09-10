"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createRegisterSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle,
  User,
  Mail,
  Lock,
  Building2,
  Loader2,
  CheckSquare,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations("register");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();

  const validationMessages = {
    nameMin: t("passwordValidation.nameMin"),
    invalidEmail: t("passwordValidation.invalidEmail"),
    minLength: t("passwordValidation.minLength"),
    uppercase: t("passwordValidation.uppercase"),
    number: t("passwordValidation.number"),
    match: t("passwordValidation.match"),
    companyMin: t("passwordValidation.companyMin"),
  };

  const registerSchema = createRegisterSchema(validationMessages);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.name,
              company: data.company,
            },
            emailRedirectTo: `${window.location.origin}/auth/login`,
          },
        }
      );

      if (signUpError) throw signUpError;

      // 2. Create profile in profiles table
      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: authData.user.id,
            full_name: data.name,
            company: data.company,
            email: data.email,
            subscription_status: "free", // default value
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (profileError) {
          console.error("Profile Creation Error:", profileError);
        }
      }

      // Show success message instead of redirecting
      setIsRegistered(true);
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err instanceof Error ? err.message : t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-16 sm:px-8 lg:px-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Back to Home link */}
        <div className="mb-4">
          <Link
            href={`/${(typeof window !== 'undefined' && window.location.pathname.split('/')[1]) || 'en'}`}
            className="inline-flex items-center text-xs text-sunset hover:text-primary transition-colors"
            aria-label={t('backToHomeAria', { defaultValue: 'Back to Home' })}
          >
            <span className="mr-1" aria-hidden="true">←</span>
            {t('backToHome', { defaultValue: 'Back to Home' })}
          </Link>
        </div>
        {!isRegistered ? (
          <>
            <h2 className="text-center text-4xl font-bold text-platinum">
              {t("createAccount")}
            </h2>
            <p className="mt-4 text-center text-base text-sunset">
              {t("startManaging")}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-center text-4xl font-bold text-platinum">
              {t("registrationSuccessful", { defaultValue: "Registration Successful!" })}
            </h2>
            <p className="mt-4 text-center text-base text-sunset">
              {t("canLoginNow", { defaultValue: "Your account has been created successfully. You can now log in to access your dashboard." })}
            </p>
          </>
        )}
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-card py-10 px-8 shadow-md sm:rounded-xl border border-card-border">
          {isRegistered ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckSquare className="w-16 h-16 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-platinum mb-2">
                  {t("welcomeAboard", { defaultValue: "Welcome aboard!" })}
                </h3>
                <p className="text-base text-sunset">
                  {t("readyToStart", { defaultValue: "You're all set to start managing your HR processes." })}
                </p>
              </div>
              <Link
                href="/auth/login"
                className="btn-primary w-full inline-flex justify-center items-center gap-3 py-3 px-4 rounded-lg shadow-sm text-base font-medium"
              >
                {t("goToLogin", { defaultValue: "Go to Login" })}
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-8 p-4 bg-error/10 rounded-lg border border-error/20 flex items-center gap-3 text-base text-error">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-3">
                  <label className="block text-base font-medium text-sunset">
                    {t("fullName")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-6 w-6 text-sunset" />
                    </div>
                    <input
                      {...register("name")}
                      type="text"
                      className="input-base pl-12 py-3 text-base"
                      placeholder={t("enterFullName")}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-base text-error flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-error rounded-full" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-base font-medium text-sunset">
                    {t("emailAddress")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-6 w-6 text-sunset" />
                    </div>
                    <input
                      {...register("email")}
                      type="email"
                      className="input-base pl-12 py-3 text-base"
                      placeholder={t("enterEmail")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-base text-error flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-error rounded-full" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-base font-medium text-sunset">
                    {t("password")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-6 w-6 text-sunset" />
                    </div>
                    <input
                      {...register("password")}
                      type="password"
                      className="input-base pl-12 py-3 text-base"
                      placeholder={t("createPassword")}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-base text-error flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-error rounded-full" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-base font-medium text-sunset">
                    {t("confirmPassword")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-6 w-6 text-sunset" />
                    </div>
                    <input
                      {...register("confirmPassword")}
                      type="password"
                      className="input-base pl-12 py-3 text-base"
                      placeholder={t("confirmPassword")}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-base text-error flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-error rounded-full" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-base font-medium text-sunset">
                    {t("companyName")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-6 w-6 text-sunset" />
                    </div>
                    <input
                      {...register("company")}
                      type="text"
                      className="input-base pl-12 py-3 text-base"
                      placeholder={t("enterCompanyName")}
                    />
                  </div>
                  {errors.company && (
                    <p className="text-base text-error flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-error rounded-full" />
                      {errors.company.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex justify-center items-center gap-3 py-3 px-4 rounded-lg shadow-sm text-base font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("creatingAccount")}
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-5 h-5" />
                      {t("createAccountButton")}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-card-border" />
                  </div>
                  <div className="relative flex justify-center text-base">
                    <span className="px-4 bg-card text-text-muted">
                      {t("alreadyHaveAccount")}
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/auth/login"
                    className="btn-secondary w-full inline-flex justify-center py-3 px-4 border border-card-border rounded-lg text-base font-medium"
                  >
                    {t("signInInstead")}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}