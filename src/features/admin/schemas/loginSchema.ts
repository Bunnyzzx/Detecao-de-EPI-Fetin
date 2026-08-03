import { z } from 'zod';

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, 'Informe o usuário.'),
  password: z.string().min(1, 'Informe a senha.'),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
