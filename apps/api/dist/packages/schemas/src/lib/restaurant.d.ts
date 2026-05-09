import { z } from 'zod';
export declare const ThemeSchema: z.ZodObject<{
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
export declare const RestaurantSchema: z.ZodObject<{
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
export declare const UpdateRestaurantSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    theme: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        secondaryColor: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        accentColor: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        fontFamily: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        accentColor?: string | undefined;
        fontFamily?: string | undefined;
    }, {
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        accentColor?: string | undefined;
        fontFamily?: string | undefined;
    }>>;
    logoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bannerUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    theme?: {
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        accentColor?: string | undefined;
        fontFamily?: string | undefined;
    } | undefined;
    logoUrl?: string | null | undefined;
    bannerUrl?: string | null | undefined;
}, {
    name?: string | undefined;
    theme?: {
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        accentColor?: string | undefined;
        fontFamily?: string | undefined;
    } | undefined;
    logoUrl?: string | null | undefined;
    bannerUrl?: string | null | undefined;
}>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Restaurant = z.infer<typeof RestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof UpdateRestaurantSchema>;
