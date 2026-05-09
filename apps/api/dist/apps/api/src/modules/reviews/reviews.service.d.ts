import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import type { CreateReviewInput } from "../../../../../packages/schemas/src/index.ts";
export declare class ReviewsService {
    private reviewsRepository;
    constructor(reviewsRepository: Repository<Review>);
    findByProduct(productId: string): Promise<Review[]>;
    create(input: CreateReviewInput): Promise<Review>;
    getAverageRating(reviews: Review[]): number | null;
    toPublic(review: Review): {
        id: string;
        productId: string;
        clientName: string;
        comment: string;
        rating: number;
        createdAt: string;
    };
}
