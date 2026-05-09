import { z } from 'zod';
export declare const ProductSchema: z.ZodObject<{
    id: z.ZodString;
    restaurantId: z.ZodString;
    name: z.ZodString;
    price: z.ZodNumber;
    preparationTimeMinutes: z.ZodNumber;
    description: z.ZodString;
    imageUrl: z.ZodNullable<z.ZodString>;
    inStock: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    createdAt: string;
    restaurantId: string;
    price: number;
    preparationTimeMinutes: number;
    description: string;
    imageUrl: string | null;
    inStock: boolean;
    updatedAt: string;
}, {
    name: string;
    id: string;
    createdAt: string;
    restaurantId: string;
    price: number;
    preparationTimeMinutes: number;
    description: string;
    imageUrl: string | null;
    inStock: boolean;
    updatedAt: string;
}>;
export declare const CreateProductSchema: z.ZodObject<{
    name: z.ZodString;
    price: z.ZodNumber;
    preparationTimeMinutes: z.ZodNumber;
    description: z.ZodString;
    imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    inStock: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    price: number;
    preparationTimeMinutes: number;
    description: string;
    inStock: boolean;
    imageUrl?: string | null | undefined;
}, {
    name: string;
    price: number;
    preparationTimeMinutes: number;
    description: string;
    imageUrl?: string | null | undefined;
    inStock?: boolean | undefined;
}>;
export declare const UpdateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    preparationTimeMinutes: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    inStock: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    price?: number | undefined;
    preparationTimeMinutes?: number | undefined;
    description?: string | undefined;
    imageUrl?: string | null | undefined;
    inStock?: boolean | undefined;
}, {
    name?: string | undefined;
    price?: number | undefined;
    preparationTimeMinutes?: number | undefined;
    description?: string | undefined;
    imageUrl?: string | null | undefined;
    inStock?: boolean | undefined;
}>;
export declare const ProductFiltersSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    inStock: z.ZodOptional<z.ZodBoolean>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    inStock?: boolean | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
}, {
    search?: string | undefined;
    inStock?: boolean | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
}>;
export type Product = z.infer<typeof ProductSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
