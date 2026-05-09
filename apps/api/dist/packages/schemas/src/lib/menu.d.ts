import { z } from 'zod';
export declare const MenuProductSchema: z.ZodObject<{
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
} & {
    reviews: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        productId: z.ZodString;
        clientName: z.ZodString;
        comment: z.ZodString;
        rating: z.ZodNumber;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        productId: string;
        clientName: string;
        comment: string;
        rating: number;
        createdAt: string;
    }, {
        id: string;
        productId: string;
        clientName: string;
        comment: string;
        rating: number;
        createdAt: string;
    }>, "many">;
    averageRating: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    reviews: {
        id: string;
        productId: string;
        clientName: string;
        comment: string;
        rating: number;
        createdAt: string;
    }[];
    id: string;
    createdAt: string;
    restaurantId: string;
    price: number;
    preparationTimeMinutes: number;
    description: string;
    imageUrl: string | null;
    inStock: boolean;
    updatedAt: string;
    averageRating: number | null;
}, {
    name: string;
    reviews: {
        id: string;
        productId: string;
        clientName: string;
        comment: string;
        rating: number;
        createdAt: string;
    }[];
    id: string;
    createdAt: string;
    restaurantId: string;
    price: number;
    preparationTimeMinutes: number;
    description: string;
    imageUrl: string | null;
    inStock: boolean;
    updatedAt: string;
    averageRating: number | null;
}>;
export declare const MenuSchema: z.ZodObject<{
    restaurant: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodString;
        email: z.ZodString;
        theme: z.ZodObject<{
            primaryColor: z.ZodDefault<z.ZodString>;
            secondaryColor: z.ZodDefault<z.ZodString>;
            accentColor: z.ZodDefault<z.ZodString>;
            fontFamily: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            primaryColor: string;
            secondaryColor: string;
            accentColor: string;
            fontFamily: string;
        }, {
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            accentColor?: string | undefined;
            fontFamily?: string | undefined;
        }>;
        logoUrl: z.ZodNullable<z.ZodString>;
        bannerUrl: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        slug: string;
        theme: {
            primaryColor: string;
            secondaryColor: string;
            accentColor: string;
            fontFamily: string;
        };
        logoUrl: string | null;
        bannerUrl: string | null;
    }, {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        slug: string;
        theme: {
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            accentColor?: string | undefined;
            fontFamily?: string | undefined;
        };
        logoUrl: string | null;
        bannerUrl: string | null;
    }>;
    products: z.ZodArray<z.ZodObject<{
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
    } & {
        reviews: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            productId: z.ZodString;
            clientName: z.ZodString;
            comment: z.ZodString;
            rating: z.ZodNumber;
            createdAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            productId: string;
            clientName: string;
            comment: string;
            rating: number;
            createdAt: string;
        }, {
            id: string;
            productId: string;
            clientName: string;
            comment: string;
            rating: number;
            createdAt: string;
        }>, "many">;
        averageRating: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        reviews: {
            id: string;
            productId: string;
            clientName: string;
            comment: string;
            rating: number;
            createdAt: string;
        }[];
        id: string;
        createdAt: string;
        restaurantId: string;
        price: number;
        preparationTimeMinutes: number;
        description: string;
        imageUrl: string | null;
        inStock: boolean;
        updatedAt: string;
        averageRating: number | null;
    }, {
        name: string;
        reviews: {
            id: string;
            productId: string;
            clientName: string;
            comment: string;
            rating: number;
            createdAt: string;
        }[];
        id: string;
        createdAt: string;
        restaurantId: string;
        price: number;
        preparationTimeMinutes: number;
        description: string;
        imageUrl: string | null;
        inStock: boolean;
        updatedAt: string;
        averageRating: number | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    products: {
        name: string;
        reviews: {
            id: string;
            productId: string;
            clientName: string;
            comment: string;
            rating: number;
            createdAt: string;
        }[];
        id: string;
        createdAt: string;
        restaurantId: string;
        price: number;
        preparationTimeMinutes: number;
        description: string;
        imageUrl: string | null;
        inStock: boolean;
        updatedAt: string;
        averageRating: number | null;
    }[];
    restaurant: {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        slug: string;
        theme: {
            primaryColor: string;
            secondaryColor: string;
            accentColor: string;
            fontFamily: string;
        };
        logoUrl: string | null;
        bannerUrl: string | null;
    };
}, {
    products: {
        name: string;
        reviews: {
            id: string;
            productId: string;
            clientName: string;
            comment: string;
            rating: number;
            createdAt: string;
        }[];
        id: string;
        createdAt: string;
        restaurantId: string;
        price: number;
        preparationTimeMinutes: number;
        description: string;
        imageUrl: string | null;
        inStock: boolean;
        updatedAt: string;
        averageRating: number | null;
    }[];
    restaurant: {
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        slug: string;
        theme: {
            primaryColor?: string | undefined;
            secondaryColor?: string | undefined;
            accentColor?: string | undefined;
            fontFamily?: string | undefined;
        };
        logoUrl: string | null;
        bannerUrl: string | null;
    };
}>;
export type MenuProduct = z.infer<typeof MenuProductSchema>;
export type Menu = z.infer<typeof MenuSchema>;
