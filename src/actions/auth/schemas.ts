import { z } from 'zod'

export const logInSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export type TLogInSchema = z.infer<typeof logInSchema>;

export const signUpSchema = z.object({
    firstname: z.string().min(2, {"message": "First name must be at least 1 characters long."}),
    lastname: z.string().min(2, {"message": "Last name must be at least 2 characters long."}),
    email: z.string().email(),
    password: z.string().min(8, {"message": "Password must be at least 8 characters long."}),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
})

export type TSignUpSchema = z.infer<typeof signUpSchema>;