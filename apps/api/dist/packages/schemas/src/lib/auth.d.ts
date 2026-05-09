import { z } from 'zod';
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    password: string;
    email: string;
}, {
    name: string;
    password: string;
    email: string;
}>;
export declare const AuthResponseSchema: z.ZodObject<{
    accessToken: z.ZodString;
    restaurant: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        name: z.ZodString;
        slug: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        email: string;
        slug: string;
    }, {
        name: string;
        id: string;
        email: string;
        slug: string;
    }>;
}, "strip", z.ZodTypeAny, {
    restaurant: {
        name: string;
        id: string;
        email: string;
        slug: string;
    };
    accessToken: string;
}, {
    restaurant: {
        name: string;
        id: string;
        email: string;
        slug: string;
    };
    accessToken: string;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
