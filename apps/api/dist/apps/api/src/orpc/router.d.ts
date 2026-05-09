import type { AuthService } from '../modules/auth/auth.service';
import type { RestaurantsService } from '../modules/restaurants/restaurants.service';
import type { ProductsService } from '../modules/products/products.service';
import type { ReviewsService } from '../modules/reviews/reviews.service';
export interface RouterServices {
    authService: AuthService;
    restaurantsService: RestaurantsService;
    productsService: ProductsService;
    reviewsService: ReviewsService;
}
export declare function createAppRouter(services: RouterServices): {
    auth: {
        login: any;
        register: any;
    };
    restaurant: {
        me: any;
        update: any;
    };
    products: {
        list: any;
        create: any;
        update: any;
        delete: any;
    };
    menu: {
        getBySlug: any;
    };
    reviews: {
        create: any;
        listByProduct: any;
    };
};
export type AppRouter = ReturnType<typeof createAppRouter>;
