import * as z from 'zod'

// Define messages type for better type safety
export type ValidationMessages = {
  nameMin: string;
  invalidEmail: string;
  minLength: string;
  uppercase: string;
  number: string;
  match: string;
  companyMin: string;
}

export const createRegisterSchema = (messages: ValidationMessages) => {
  return z.object({
    name: z.string().min(2, messages.nameMin),
    email: z.string().email(messages.invalidEmail),
    password: z
      .string()
      .min(6, messages.minLength)
      .regex(/[A-Z]/, messages.uppercase)
      .regex(/[0-9]/, messages.number),
    confirmPassword: z.string(),
    company: z.string().min(2, messages.companyMin),
  }).refine((data) => data.password === data.confirmPassword, {
    message: messages.match,
    path: ["confirmPassword"],
  });
};

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
})

export type LoginFormValues = z.infer<typeof loginSchema>
type RegisterSchema = ReturnType<typeof createRegisterSchema>
export type RegisterFormValues = z.infer<RegisterSchema>