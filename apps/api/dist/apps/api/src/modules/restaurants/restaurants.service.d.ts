import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import type { UpdateRestaurantInput } from "../../../../../packages/schemas/src/index.ts";
export declare class RestaurantsService {
    private restaurantsRepository;
    constructor(restaurantsRepository: Repository<Restaurant>);
    findById(id: string): Promise<Restaurant>;
    findBySlug(slug: string): Promise<Restaurant>;
    update(id: string, input: UpdateRestaurantInput): Promise<Restaurant>;
    toPublic(restaurant: Restaurant): {
        id: string;
        name: string;
        slug: string;
        email: string;
        theme: {
            primaryColor: string;
            secondaryColor: string;
            accentColor: string;
            fontFamily: string;
        };
        logoUrl: string | null;
        bannerUrl: string | null;
        createdAt: string;
        updatedAt: string;
    };
}
