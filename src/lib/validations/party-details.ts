import { z } from "zod/v4";

export const partyDetailsSchema = z.object({
  plaintiff: z.object({
    fullName: z.string().min(2, "Введіть ПІБ позивача"),
    birthDate: z.string().min(1, "Введіть дату народження"),
    registrationAddress: z.string().min(5, "Введіть адресу реєстрації"),
    actualAddress: z.string().optional(),
    phone: z.string().min(10, "Введіть номер телефону"),
    ipn: z.string().optional(),
  }),
  defendant: z.object({
    fullName: z.string().min(2, "Введіть ПІБ відповідача"),
    birthDate: z.string().optional(),
    registrationAddress: z.string().min(5, "Введіть адресу відповідача"),
    actualAddress: z.string().optional(),
    phone: z.string().optional(),
  }),
});

export type PartyDetailsData = z.infer<typeof partyDetailsSchema>;
