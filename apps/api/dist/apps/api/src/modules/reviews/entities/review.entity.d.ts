import { Product } from '../../products/entities/product.entity';
export declare class Review {
    id: string;
    productId: string;
    product: Product;
    clientName: string;
    comment: string;
    rating: number;
    createdAt: Date;
}
