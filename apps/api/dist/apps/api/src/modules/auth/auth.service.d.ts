import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import type { LoginInput, RegisterInput } from "../../../../../packages/schemas/src/index.ts";
export declare class AuthService {
    private restaurantsRepository;
    private jwtService;
    constructor(restaurantsRepository: Repository<Restaurant>, jwtService: JwtService);
    login(input: LoginInput): Promise<{
        accessToken: string;
        restaurant: {
            id: string;
            email: string;
            name: string;
            slug: string;
        };
    }>;
    register(input: RegisterInput): Promise<{
        accessToken: string;
        restaurant: {
            id: string;
            email: string;
            name: string;
            slug: string;
        };
    }>;
    validateById(id: string): Promise<Restaurant | null>;
    private generateAuthResponse;
    private generateSlug;
    private ensureUniqueSlug;
}
