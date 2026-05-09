import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import type { CreateProductInput, UpdateProductInput, ProductFilters } from "../../../../../packages/schemas/src/index.ts";
export declare class ProductsService {
    private productsRepository;
    constructor(productsRepository: Repository<Product>);
    findByRestaurant(restaurantId: string, filters?: ProductFilters): Promise<Product[]>;
    findById(id: string): Promise<Product>;
    create(restaurantId: string, input: CreateProductInput): Promise<Product>;
    update(id: string, restaurantId: string, input: UpdateProductInput): Promise<Product>;
    remove(id: string, restaurantId: string): Promise<{
        success: boolean;
    }>;
    toPublic(product: Product): {
        id: string;
        restaurantId: string;
        name: string;
        price: number;
        preparationTimeMinutes: number;
        description: string;
        imageUrl: string | null;
        inStock: boolean;
        createdAt: string;
        updatedAt: string;
    };
}
