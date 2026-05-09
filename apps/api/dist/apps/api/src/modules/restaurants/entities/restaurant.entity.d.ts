import { Product } from '../../products/entities/product.entity';
export declare class Restaurant {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    slug: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        fontFamily: string;
    };
    logoUrl: string | null;
    bannerUrl: string | null;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
}
