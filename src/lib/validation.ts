import { z } from "zod";

export const createOrderSchema = z.object({
  categorySlug: z.string().min(1),
  serviceSlug: z.string().min(1),
  fullName: z.string().trim().min(3, "نام باید حداقل ۳ حرف باشد").max(150),
  phone: z
    .string()
    .trim()
    .regex(/^0?9\d{9}$/, "شماره موبایل معتبر نیست"),
  email: z.string().trim().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  description: z.string().trim().min(10, "توضیحات باید حداقل ۱۰ حرف باشد").max(4000),
  quantity: z.number().int().min(1).max(500).default(1),
  urgent: z.boolean().default(false),
  attachment: z
    .object({
      name: z.string().max(255),
      mime: z.string().max(100),
      data: z.string(), // base64
    })
    .nullable()
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = z.object({
  status: z.enum(["pending", "accepted", "completed", "delivered", "cancelled"]).optional(),
  adminNote: z.string().max(4000).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(150),
  phone: z
    .string()
    .trim()
    .regex(/^0?9\d{9}$/, "شماره موبایل معتبر نیست"),
  message: z.string().trim().min(5).max(2000),
});
