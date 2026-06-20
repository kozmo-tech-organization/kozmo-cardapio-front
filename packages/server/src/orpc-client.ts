import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type {
  AuthResponse,
  Restaurant,
  Product,
  Menu,
  Review,
  LoginInput,
  RegisterInput,
  UpdateRestaurantInput,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  CreateReviewInput,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  Promotion,
  CreatePromotionInput,
  UpdatePromotionInput,
  Order,
  CreateOrderInput,
  UpdateOrderStatusInput,
  CustomerSummary,
  Coupon,
  CreateCouponInput,
  UpdateCouponInput,
  ValidateCouponInput,
  ValidateCouponResult,
  Table,
  CreateTableInput,
  WaiterCall,
  CreateWaiterCallInput,
  UpdateWaiterCallStatusInput,
} from '@repo/schemas'
import { getRpcUrl, getAuthHeaders } from './http-client'

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = createORPCClient<any>(
  new RPCLink({
    url: getRpcUrl(),
    headers: () => getAuthHeaders(authToken),
  }),
)

export const orpcClient = {
  auth: {
    login: (input: LoginInput): Promise<AuthResponse> => rpc.auth.login(input),
    register: (input: RegisterInput): Promise<AuthResponse> => rpc.auth.register(input),
  },
  restaurant: {
    me: (): Promise<Restaurant> => rpc.restaurant.me(),
    update: (input: UpdateRestaurantInput): Promise<Restaurant> =>
      rpc.restaurant.update(input),
  },
  products: {
    list: (input?: ProductFilters): Promise<Product[]> => rpc.products.list(input),
    create: (input: CreateProductInput): Promise<Product> => rpc.products.create(input),
    update: (input: { id: string } & UpdateProductInput): Promise<Product> =>
      rpc.products.update(input),
    delete: (input: { id: string }): Promise<{ success: boolean }> =>
      rpc.products.delete(input),
  },
  menu: {
    getBySlug: (input: { slug: string }): Promise<Menu> => rpc.menu.getBySlug(input),
  },
  reviews: {
    create: (input: CreateReviewInput): Promise<Review> => rpc.reviews.create(input),
    listByProduct: (input: { productId: string }): Promise<Review[]> =>
      rpc.reviews.listByProduct(input),
  },
  categories: {
    list: (): Promise<Category[]> => rpc.categories.list(),
    create: (input: CreateCategoryInput): Promise<Category> => rpc.categories.create(input),
    update: (input: { id: string } & UpdateCategoryInput): Promise<Category> =>
      rpc.categories.update(input),
    delete: (input: { id: string }): Promise<{ success: boolean }> =>
      rpc.categories.delete(input),
    setProducts: (input: { categoryId: string; productIds: string[] }): Promise<Category> =>
      rpc.categories.setProducts(input),
  },
  promotions: {
    list: (): Promise<Promotion[]> => rpc.promotions.list(),
    create: (input: CreatePromotionInput): Promise<Promotion> => rpc.promotions.create(input),
    update: (input: { id: string } & UpdatePromotionInput): Promise<Promotion> =>
      rpc.promotions.update(input),
    delete: (input: { id: string }): Promise<{ success: boolean }> =>
      rpc.promotions.delete(input),
    setProducts: (input: { promotionId: string; productIds: string[] }): Promise<Promotion> =>
      rpc.promotions.setProducts(input),
  },
  orders: {
    create: (input: CreateOrderInput): Promise<Order> => rpc.orders.create(input),
    list: (): Promise<Order[]> => rpc.orders.list(),
    getById: (input: { id: string }): Promise<Order> => rpc.orders.getById(input),
    customers: (): Promise<CustomerSummary[]> => rpc.orders.customers(),
    updateStatus: (input: UpdateOrderStatusInput): Promise<Order> => rpc.orders.updateStatus(input),
  },
  coupons: {
    list: (): Promise<Coupon[]> => rpc.coupons.list(),
    create: (input: CreateCouponInput): Promise<Coupon> => rpc.coupons.create(input),
    update: (input: { id: string } & UpdateCouponInput): Promise<Coupon> => rpc.coupons.update(input),
    delete: (input: { id: string }): Promise<{ success: boolean }> => rpc.coupons.delete(input),
    validate: (input: ValidateCouponInput): Promise<ValidateCouponResult> => rpc.coupons.validate(input),
  },
  tables: {
    list: (): Promise<Table[]> => rpc.tables.list(),
    create: (input: CreateTableInput): Promise<Table> => rpc.tables.create(input),
    delete: (input: { id: string }): Promise<{ success: boolean }> => rpc.tables.delete(input),
    getById: (input: { id: string }): Promise<Table> => rpc.tables.getById(input),
  },
  waiterCalls: {
    create: (input: CreateWaiterCallInput): Promise<WaiterCall> => rpc.waiterCalls.create(input),
    getById: (input: { id: string }): Promise<WaiterCall> => rpc.waiterCalls.getById(input),
    list: (): Promise<WaiterCall[]> => rpc.waiterCalls.list(),
    updateStatus: (input: UpdateWaiterCallStatusInput): Promise<WaiterCall> => rpc.waiterCalls.updateStatus(input),
  },
}

export type AppClient = typeof orpcClient
