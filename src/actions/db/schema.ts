import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(2, {"message": "First name must be at least 1 characters long."})
})

export type TProjectSchema = z.infer<typeof projectSchema>;