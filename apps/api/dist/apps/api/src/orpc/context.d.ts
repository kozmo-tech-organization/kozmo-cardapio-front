import { IncomingMessage } from 'http';
import { JwtService } from '@nestjs/jwt';
export interface ORPCContext {
    restaurant: {
        id: string;
        email: string;
        slug: string;
    } | null;
    rawRequest: IncomingMessage;
}
export declare function createContextBuilder(jwtService: JwtService): (req: IncomingMessage) => Promise<ORPCContext>;
