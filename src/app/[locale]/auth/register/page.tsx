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

      router.push("/auth/verify-email?email=" + encodeURIComponent(data.email));
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
        <h2 className="text-center text-4xl font-bold text-platinum">
          {t("createAccount")}
        </h2>
        <p className="mt-4 text-center text-base text-sunset">
          {t("startManaging")}
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-card py-10 px-8 shadow-md sm:rounded-xl border border-card-border">
          {error && (
            <div className="mb-8 p-4 bg-error/10 rounded-lg border border-error/20 flex items-center gap-3 text-base text-error">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Google OAuth Button */}
          {/* <button
            type="button"
            onClick={async () => {
              setIsLoading(true);
              setError(null);
              const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
              if (error) setError(error.message);
              setIsLoading(false);
            }}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg shadow-md bg-white border border-card-border text-rich-black font-semibold text-base hover:bg-vanilla transition-colors mb-6"
            aria-label={t('signUpWithGoogle', { defaultValue: 'Sign up with Google' })}
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.61l6.88-6.88C36.36 2.26 30.65 0 24 0 14.82 0 6.67 5.46 2.69 13.44l8.06 6.26C12.5 13.2 17.79 9.5 24 9.5z"/><path fill="#34A853" d="M46.14 24.55c0-1.6-.14-3.14-.39-4.61H24v9.09h12.41c-.54 2.9-2.18 5.36-4.69 7.02l7.18 5.59c4.17-3.85 6.59-9.53 6.59-16.09z"/><path fill="#FBBC05" d="M10.75 28.17c-.7-2.09-1.1-4.31-1.1-6.67s.4-4.58 1.1-6.67l-8.06-6.26C1.02 12.51 0 15.16 0 18c0 2.84 1.02 5.49 2.69 7.77l8.06-6.26z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.14 15.9-5.81l-7.18-5.59c-2 1.36-4.54 2.16-8.72 2.16-6.21 0-11.5-3.7-13.25-8.85l-8.06 6.26C6.67 42.54 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
            {t('signUpWithGoogle', { defaultValue: 'Sign up with Google' })}
          </button> */}

          {/* Divider */}
          {/* <div className="flex items-center my-6">
            <div className="flex-grow border-t border-card-border"></div>
            <span className="mx-4 text-text-muted text-xs font-medium">{t('orContinueWithEmail', { defaultValue: 'or continue with email' })}</span>
            <div className="flex-grow border-t border-card-border"></div>
          </div> */}

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
        </div>
      </div>
    </div>
  );
}
