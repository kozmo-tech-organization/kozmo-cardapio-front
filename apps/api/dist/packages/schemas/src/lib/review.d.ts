import { z } from 'zod';
export declare const ReviewSchema: z.ZodObject<{
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
}>;
export declare const CreateReviewSchema: z.ZodObject<{
    productId: z.ZodString;
    clientName: z.ZodString;
    comment: z.ZodString;
    rating: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: string;
    clientName: string;
    comment: string;
    rating: number;
}, {
    productId: string;
    clientName: string;
    comment: string;
    rating: number;
}>;
export type Review = z.infer<typeof ReviewSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
