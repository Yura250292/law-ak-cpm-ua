import { z } from "zod/v4";

export const circumstancesSchema = z.object({
  marriageDate: z.string().min(1, "Введіть дату реєстрації шлюбу"),
  marriagePlace: z.string().min(2, "Введіть місце реєстрації"),
  separationDate: z.string().optional(),
  hasChildren: z.boolean(),
  childrenDetails: z.string().optional(),
  hasProperty: z.boolean(),
  propertyDetails: z.string().optional(),
  circumstances: z.string().min(10, "Опишіть обставини справи"),
});

export type CircumstancesData = z.infer<typeof circumstancesSchema>;
