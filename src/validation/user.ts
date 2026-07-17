import { z } from "zod/v4";

const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/;

// LOGIN
export const loginSchema = z.object({
  email: z.email("Email must be valid").trim().toLowerCase(),
  password: z.string().regex(passwordRegex, "Password isn't strong enough"),
});

//REGISTER
export const registerSchema = loginSchema.extend({
  firstname: z.string().min(3).trim(),
  lastname: z.string().min(1).trim(),
  tel: z.string().min(10),
});

//UPDATE ROLE BY ADMIN
export const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "staff"]),
});

//UPDATE PROFILE INFO
export const updateProfileSchema = z.object({
  firstname: z
    .string()
    .min(3, "firstname must have at least 3 characters")
    .max(30, "firstname must have at most 30 characters")
    .trim()
    .optional(),
  lastname: z
    .string()
    .min(1, "lastname must have at least 1 characters")
    .max(30, "lastname must have at most 30 characters")
    .trim()
    .optional(),
  email: z.email("Email must be valid").trim().toLowerCase().optional(),
  tel: z.string().min(10).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
