import { z } from 'zod';

import { USER_ROLES } from '../types';

export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Informe o nome completo do operador.')
    .max(80, 'O nome deve ter no máximo 80 caracteres.'),
  email: z.email('Informe um e-mail válido.'),
  role: z.enum(USER_ROLES),
  area: z
    .string()
    .trim()
    .min(2, 'Informe a área de atuação.')
    .max(60, 'A área deve ter no máximo 60 caracteres.'),
  status: z.enum(['active', 'inactive']),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
