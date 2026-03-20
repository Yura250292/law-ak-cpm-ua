import { z } from "zod/v4";

export const requirementsSchema = z.object({
  demands: z
    .array(z.string().min(1, "Вимога не може бути порожньою"))
    .min(1, "Додайте хоча б одну вимогу"),
  courtName: z.string().min(3, "Введіть назву суду"),
  additionalNotes: z.string().optional(),
  contactEmail: z.string().email("Введіть коректний email"),
  contactPhone: z.string().optional(),
});

export type RequirementsData = z.infer<typeof requirementsSchema>;
