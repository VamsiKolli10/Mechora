const { z } = require("zod");

const emailSchema = z.string().trim().min(3).max(255).email();
const passwordSchema = z.string().min(8).max(128);
const optionalString = z.string().trim().max(255).optional();
const numberId = () => z.coerce.number().int().positive();

const addressSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    street: z.string().trim().min(1).max(255),
    street2: z.string().trim().max(255).optional().nullable(),
    city: z.string().trim().min(1).max(255),
    state: z.string().trim().min(1).max(255),
    zip: z.string().trim().min(2).max(20),
    country: z.string().trim().min(2).max(2).default("US"),
    phone: z.string().trim().min(7).max(20).optional(),
  })
  .strict();

const watchBaseSchema = z
  .object({
    brand_id: numberId().optional(),
    collection_id: numberId().optional(),
    brand: optionalString,
    model: z.string().trim().min(1).max(255),
    reference: optionalString,
    sku: optionalString,
    slug: optionalString,
    complication: optionalString,
    case_material: optionalString,
    bracelet_material: optionalString,
    dial: optionalString,
    hour_markings: optionalString,
    lunette_material: optionalString,
    sale_price: z.coerce.number().min(0).optional(),
    price: z.coerce.number().min(0).optional(),
    msrp: z.coerce.number().min(0).optional(),
    stock_status: z.string().trim().max(50).optional(),
    stock_quantity: z.coerce.number().int().min(0).optional(),
    movement: optionalString,
    condition: optionalString,
    case_size: optionalString,
    water_resistance: optionalString,
    power_reserve: optionalString,
    description: optionalString,
    short_description: optionalString,
    is_active: z.boolean().optional(),
    is_featured: z.boolean().optional(),
  })
  .partial()
  .strict();

const paymentMethodSchema = z
  .object({
    type: z.enum(["card", "bank", "wallet"]).optional(),
    provider: z.string().trim().min(2).max(50),
    provider_payment_method_id: z.string().trim().min(2).max(255),
    last4: z.string().trim().min(2).max(4),
    brand: optionalString,
    expiry_month: z.coerce.number().int().min(1).max(12),
    expiry_year: z
      .coerce.number()
      .int()
      .min(new Date().getFullYear())
      .max(new Date().getFullYear() + 20),
    is_default: z.boolean().optional(),
    metadata: z.record(z.any()).optional(),
  })
  .strict();

const authSchemas = {
  login: {
    body: z
      .object({
        email: emailSchema,
        password: passwordSchema,
        mfa_code: z.string().trim().length(6).optional(),
      })
      .strict(),
  },
  signup: {
    body: z
      .object({
        name: z.string().trim().min(2).max(255),
        email: emailSchema,
        password: passwordSchema,
      })
      .strict(),
  },
  refresh: {
    body: z
      .object({
        refresh_token: z.string().min(16).optional(),
      })
      .strict(),
  },
  requestPasswordReset: {
    body: z.object({ email: emailSchema }).strict(),
  },
  resetPassword: {
    body: z
      .object({
        token: z.string().min(16),
        password: passwordSchema,
      })
      .strict(),
  },
  verifyEmail: {
    body: z.object({ token: z.string().min(16) }).strict(),
  },
};

const cartSchemas = {
  addItem: {
    body: z
      .object({
        watch_id: numberId(),
        quantity: z.coerce.number().int().min(1).max(10).optional(),
      })
      .strict(),
  },
  updateItem: {
    params: z.object({ itemId: numberId() }).strict(),
    body: z.object({ quantity: z.coerce.number().int().min(1).max(10) }).strict(),
  },
  removeItem: {
    params: z.object({ itemId: numberId() }).strict(),
  },
  mergeCart: {
    body: z.object({ guest_token: z.string().min(20).optional() }).strict(),
  },
};

const orderSchemas = {
  create: {
    body: z
      .object({
        guest_email: emailSchema.optional(),
        shipping_address: addressSchema,
        billing_address: addressSchema.optional(),
        notes: z.string().trim().max(1000).optional(),
        tax_amount: z.coerce.number().min(0).optional(),
        shipping_amount: z.coerce.number().min(0).optional(),
      })
      .strict(),
  },
  getOrder: {
    params: z.object({ orderId: numberId() }).strict(),
  },
  getOrderByNumber: {
    params: z.object({ orderNumber: z.string().trim().min(4).max(50) }).strict(),
  },
  updateStatus: {
    params: z.object({ orderId: numberId() }).strict(),
    body: z
      .object({
        status: z.string().trim().min(3).max(50),
        notes: z.string().trim().max(1000).optional(),
      })
      .strict(),
  },
};

const accountSchemas = {
  updateProfile: {
    body: z
      .object({
        name: z.string().trim().min(2).max(255).optional(),
        email: emailSchema.optional(),
      })
      .strict(),
  },
  changePassword: {
    body: z
      .object({
        current_password: passwordSchema,
        new_password: passwordSchema,
      })
      .strict(),
  },
  createAddress: {
    body: addressSchema
      .extend({
        label: z.string().trim().max(50).optional(),
        type: z.enum(["shipping", "billing"]).optional(),
        is_default: z.boolean().optional(),
      })
      .strict(),
  },
  updateAddress: {
    params: z.object({ addressId: numberId() }).strict(),
    body: addressSchema
      .extend({
        label: z.string().trim().max(50).optional(),
        type: z.enum(["shipping", "billing"]).optional(),
        is_default: z.boolean().optional(),
      })
      .partial()
      .strict(),
  },
  paymentMethod: {
    body: paymentMethodSchema,
  },
  setDefaultPayment: {
    params: z.object({ paymentMethodId: numberId() }).strict(),
  },
  deletePayment: {
    params: z.object({ paymentMethodId: numberId() }).strict(),
  },
  setDefaultAddress: {
    params: z.object({ addressId: numberId() }).strict(),
  },
  mfaSetup: {
    body: z.object({}).strict(),
  },
  mfaEnable: {
    body: z.object({ code: z.string().trim().length(6) }).strict(),
  },
  mfaDisable: {
    body: z.object({ code: z.string().trim().length(6) }).strict(),
  },
};

const watchSchemas = {
  list: {
    query: z
      .object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        brand_id: numberId().optional(),
        collection_id: numberId().optional(),
        min_price: z.coerce.number().min(0).optional(),
        max_price: z.coerce.number().min(0).optional(),
        stock_status: optionalString,
        condition: optionalString,
        is_active: z.string().trim().optional(),
        is_featured: z.string().trim().optional(),
        sort_by: optionalString,
        sort_order: optionalString,
        search: optionalString,
      })
      .strict()
      .partial(),
  },
  create: {
    body: watchBaseSchema,
  },
  update: {
    params: z.object({ id: numberId() }).strict(),
    body: watchBaseSchema,
  },
  delete: {
    params: z.object({ id: numberId() }).strict(),
  },
};

const brandSchemas = {
  create: {
    body: z
      .object({
        name: z.string().trim().min(2).max(255),
        description: z.string().trim().max(1000).optional(),
        slug: optionalString,
      })
      .strict(),
  },
  update: {
    params: z.object({ id: numberId() }).strict(),
    body: z
      .object({
        name: z.string().trim().min(2).max(255).optional(),
        description: z.string().trim().max(1000).optional(),
        slug: optionalString,
      })
      .strict(),
  },
};

const collectionSchemas = {
  create: {
    body: z
      .object({
        name: z.string().trim().min(2).max(255),
        description: z.string().trim().max(1000).optional(),
        slug: optionalString,
      })
      .strict(),
  },
  update: {
    params: z.object({ id: numberId() }).strict(),
    body: z
      .object({
        name: z.string().trim().min(2).max(255).optional(),
        description: z.string().trim().max(1000).optional(),
        slug: optionalString,
      })
      .strict(),
  },
};

const wishlistSchemas = {
  add: {
    body: z.object({ watch_id: numberId() }).strict(),
  },
  remove: {
    params: z.object({ watchId: numberId() }).strict(),
  },
};

const recentSchemas = {
  add: {
    body: z.object({ watch_id: numberId() }).strict(),
  },
  clear: {
    query: z.object({}).strict(),
  },
};

const searchSchemas = {
  search: {
    query: z
      .object({
        q: z.string().trim().min(1),
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(50).optional(),
      })
      .strict(),
  },
  suggestions: {
    query: z
      .object({
        q: z.string().trim().min(2),
        limit: z.coerce.number().int().min(1).max(20).optional(),
      })
      .strict(),
  },
};

const userRoleEnum = z.enum(["customer", "admin", "staff"]);
const userIdParams = z.object({ id: numberId() }).strict();

const adminUserSchemas = {
  create: {
    body: z
      .object({
        name: z.string().trim().min(2).max(255),
        email: emailSchema,
        password: passwordSchema,
        role: userRoleEnum.optional(),
      })
      .strict(),
  },
  update: {
    params: userIdParams,
    body: z
      .object({
        name: z.string().trim().min(2).max(255).optional(),
        email: emailSchema.optional(),
        password: passwordSchema.optional(),
        role: userRoleEnum.optional(),
      })
      .strict(),
  },
  byId: {
    params: userIdParams,
  },
  delete: {
    params: userIdParams,
  },
};

module.exports = {
  authSchemas,
  cartSchemas,
  orderSchemas,
  accountSchemas,
  watchSchemas,
  brandSchemas,
  collectionSchemas,
  wishlistSchemas,
  recentSchemas,
  searchSchemas,
  addressSchema,
  adminUserSchemas,
};
