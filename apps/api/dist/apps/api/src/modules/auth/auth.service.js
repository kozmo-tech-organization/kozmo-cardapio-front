"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const restaurant_entity_1 = require("../restaurants/entities/restaurant.entity");
let AuthService = class AuthService {
    constructor(restaurantsRepository, jwtService) {
        this.restaurantsRepository = restaurantsRepository;
        this.jwtService = jwtService;
    }
    async login(input) {
        const restaurant = await this.restaurantsRepository.findOne({
            where: { email: input.email },
        });
        if (!restaurant) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(input.password, restaurant.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.generateAuthResponse(restaurant);
    }
    async register(input) {
        const existing = await this.restaurantsRepository.findOne({
            where: { email: input.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already in use');
        }
        const passwordHash = await bcrypt.hash(input.password, 12);
        const slug = this.generateSlug(input.name);
        const restaurant = this.restaurantsRepository.create({
            email: input.email,
            passwordHash,
            name: input.name,
            slug: await this.ensureUniqueSlug(slug),
            theme: {
                primaryColor: '#000000',
                secondaryColor: '#ffffff',
                accentColor: '#ff6b35',
                fontFamily: 'Inter',
            },
            logoUrl: null,
            bannerUrl: null,
        });
        await this.restaurantsRepository.save(restaurant);
        return this.generateAuthResponse(restaurant);
    }
    async validateById(id) {
        return this.restaurantsRepository.findOne({ where: { id } });
    }
    generateAuthResponse(restaurant) {
        const payload = { sub: restaurant.id, email: restaurant.email };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            restaurant: {
                id: restaurant.id,
                email: restaurant.email,
                name: restaurant.name,
                slug: restaurant.slug,
            },
        };
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    async ensureUniqueSlug(slug) {
        const existing = await this.restaurantsRepository.findOne({ where: { slug } });
        if (!existing)
            return slug;
        return `${slug}-${Date.now()}`;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map