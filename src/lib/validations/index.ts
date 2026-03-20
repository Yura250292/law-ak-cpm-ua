import { z } from "zod/v4";
import { partyDetailsSchema } from "./party-details";
import { circumstancesSchema } from "./circumstances";
import { requirementsSchema } from "./requirements";

export const documentFormSchema = z.object({
  ...partyDetailsSchema.shape,
  ...circumstancesSchema.shape,
  ...requirementsSchema.shape,
});

export type DocumentFormData = z.infer<typeof documentFormSchema>;

export { partyDetailsSchema, circumstancesSchema, requirementsSchema };
export type { PartyDetailsData } from "./party-details";
export type { CircumstancesData } from "./circumstances";
export type { RequirementsData } from "./requirements";
