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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
let ProductsService = class ProductsService {
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    async findByRestaurant(restaurantId, filters) {
        const where = { restaurantId };
        if (filters?.inStock !== undefined)
            where.inStock = filters.inStock;
        if (filters?.search)
            where.name = (0, typeorm_2.ILike)(`%${filters.search}%`);
        const products = await this.productsRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });
        return products.filter((p) => {
            if (filters?.minPrice !== undefined && p.price < filters.minPrice)
                return false;
            if (filters?.maxPrice !== undefined && p.price > filters.maxPrice)
                return false;
            return true;
        });
    }
    async findById(id) {
        const product = await this.productsRepository.findOne({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async create(restaurantId, input) {
        const product = this.productsRepository.create({
            ...input,
            restaurantId,
            price: input.price,
            imageUrl: input.imageUrl ?? null,
        });
        return this.productsRepository.save(product);
    }
    async update(id, restaurantId, input) {
        const product = await this.findById(id);
        if (product.restaurantId !== restaurantId)
            throw new common_1.ForbiddenException();
        Object.assign(product, input);
        return this.productsRepository.save(product);
    }
    async remove(id, restaurantId) {
        const product = await this.findById(id);
        if (product.restaurantId !== restaurantId)
            throw new common_1.ForbiddenException();
        await this.productsRepository.remove(product);
        return { success: true };
    }
    toPublic(product) {
        return {
            id: product.id,
            restaurantId: product.restaurantId,
            name: product.name,
            price: Number(product.price),
            preparationTimeMinutes: product.preparationTimeMinutes,
            description: product.description,
            imageUrl: product.imageUrl,
            inStock: product.inStock,
            createdAt: product.createdAt.toISOString(),
            updatedAt: product.updatedAt.toISOString(),
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map