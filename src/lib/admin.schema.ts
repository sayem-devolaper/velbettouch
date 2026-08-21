import { z } from "zod";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const adminOrderUpdateSchema = z.object({
  id: z.string().uuid(),
  customer_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/),
  address: z.string().trim().min(5).max(500),
  delivery_area: z.enum(["inside_dhaka", "outside_dhaka"]),
  quantity: z.number().int().min(1).max(50),
  status: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export const adminOrderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(ORDER_STATUSES),
});

export const adminOrderIdSchema = z.object({ id: z.string().uuid() });