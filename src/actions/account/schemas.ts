import { z } from 'zod'

export const accountSchema = z.object({
  email: z.optional(z.string().email()),
  firstname: z.string().min(2, {"message": "First name must be at least 1 characters long."}),
  lastname: z.string().min(2, {"message": "Last name must be at least 2 characters long."}),
})

export type TAccountSchema = z.infer<typeof accountSchema>;