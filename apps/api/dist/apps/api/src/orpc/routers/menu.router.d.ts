import type { RestaurantsService } from '../../modules/restaurants/restaurants.service';
import type { ProductsService } from '../../modules/products/products.service';
import type { ReviewsService } from '../../modules/reviews/reviews.service';
export declare function createMenuRouter(restaurantsService: RestaurantsService, productsService: ProductsService, reviewsService: ReviewsService): {
    getBySlug: any;
};
