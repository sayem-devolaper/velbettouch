import { z } from "zod";

export const orderInputSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(2, { message: "আপনার নাম লিখুন" })
    .max(100, { message: "নাম অনেক বড় হয়ে গেছে" }),
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, { message: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন" }),
  address: z
    .string()
    .trim()
    .min(10, { message: "সম্পূর্ণ ঠিকানা লিখুন (গ্রাম/এলাকা, থানা, জেলা)" })
    .max(500, { message: "ঠিকানা অনেক বড় হয়ে গেছে" }),
  delivery_area: z.enum(["inside_dhaka", "outside_dhaka"]),
  quantity: z.number().int().min(1).max(50),
  note: z.string().trim().max(300).optional().or(z.literal("")),
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
  utm_content: z.string().max(200).optional(),
  utm_term: z.string().max(200).optional(),
  utm_id: z.string().max(200).optional(),
  fbclid: z.string().max(500).optional(),
  page_url: z.string().max(1000).optional(),
});

export type OrderInput = z.infer<typeof orderInputSchema>;