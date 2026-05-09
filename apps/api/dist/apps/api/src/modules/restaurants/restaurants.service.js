"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_entity_1 = require("./entities/restaurant.entity");
let RestaurantsService = class RestaurantsService {
    constructor(restaurantsRepository) {
        this.restaurantsRepository = restaurantsRepository;
    }
    async findById(id) {
        const restaurant = await this.restaurantsRepository.findOne({ where: { id } });
        if (!restaurant)
            throw new common_1.NotFoundException('Restaurant not found');
        return restaurant;
    }
    async findBySlug(slug) {
        const restaurant = await this.restaurantsRepository.findOne({ where: { slug } });
        if (!restaurant)
            throw new common_1.NotFoundException('Restaurant not found');
        return restaurant;
    }
    async update(id, input) {
        const restaurant = await this.findById(id);
        if (input.name !== undefined)
            restaurant.name = input.name;
        if (input.logoUrl !== undefined)
            restaurant.logoUrl = input.logoUrl;
        if (input.bannerUrl !== undefined)
            restaurant.bannerUrl = input.bannerUrl;
        if (input.theme) {
            restaurant.theme = { ...restaurant.theme, ...input.theme };
        }
        return this.restaurantsRepository.save(restaurant);
    }
    toPublic(restaurant) {
        return {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            email: restaurant.email,
            theme: restaurant.theme,
            logoUrl: restaurant.logoUrl,
            bannerUrl: restaurant.bannerUrl,
            createdAt: restaurant.createdAt.toISOString(),
            updatedAt: restaurant.updatedAt.toISOString(),
        };
    }
};
exports.RestaurantsService = RestaurantsService;
exports.RestaurantsService = RestaurantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RestaurantsService);
//# sourceMappingURL=restaurants.service.js.map