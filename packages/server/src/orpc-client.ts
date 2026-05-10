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
}

export type AppClient = typeof orpcClient
