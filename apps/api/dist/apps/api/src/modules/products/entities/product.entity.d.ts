import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { Review } from '../../reviews/entities/review.entity';
export declare class Product {
    id: string;
    restaurantId: string;
    restaurant: Restaurant;
    name: string;
    price: number;
    preparationTimeMinutes: number;
    description: string;
    imageUrl: string | null;
    inStock: boolean;
    reviews: Review[];
    createdAt: Date;
    updatedAt: Date;
}
