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
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const database_module_1 = require("../db/database.module");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema = __importStar(require("../db/schema"));
const crypto_1 = require("crypto");
const drizzle_orm_1 = require("drizzle-orm");
let AuthService = class AuthService {
    usersService;
    jwtService;
    db;
    constructor(usersService, jwtService, db) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.db = db;
    }
    async register(dto) {
        const passwordHash = await argon2.hash(dto.password);
        const user = await this.usersService.create({
            email: dto.email,
            passwordHash,
            role: dto.role,
        });
        return this.generateTokens(user.id, user.role);
    }
    async login(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const isMatch = await argon2.verify(user.passwordHash, dto.password);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.generateTokens(user.id, user.role);
    }
    async refreshTokens(refreshToken) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const tokenRecord = await this.db.query.refreshTokens.findFirst({
            where: (0, drizzle_orm_1.eq)(schema.refreshTokens.tokenHash, refreshToken),
        });
        if (!tokenRecord) {
            throw new common_1.UnauthorizedException('Refresh token not found');
        }
        if (tokenRecord.isRevoked) {
            await this.db.update(schema.refreshTokens)
                .set({ isRevoked: true })
                .where((0, drizzle_orm_1.eq)(schema.refreshTokens.familyId, tokenRecord.familyId));
            throw new common_1.UnauthorizedException('Token reuse detected. Session revoked.');
        }
        await this.db.update(schema.refreshTokens)
            .set({ isRevoked: true })
            .where((0, drizzle_orm_1.eq)(schema.refreshTokens.id, tokenRecord.id));
        const user = await this.usersService.findById(payload.sub);
        return this.generateTokens(user.id, user.role, tokenRecord.familyId);
    }
    async logout(refreshToken) {
        await this.db.update(schema.refreshTokens)
            .set({ isRevoked: true })
            .where((0, drizzle_orm_1.eq)(schema.refreshTokens.tokenHash, refreshToken));
    }
    async generateTokens(userId, role, familyId) {
        const payload = { sub: userId, role };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: (process.env.JWT_ACCESS_EXPIRATION || '15m'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: (process.env.JWT_REFRESH_EXPIRATION || '7d'),
        });
        const finalFamilyId = familyId || (0, crypto_1.randomUUID)();
        await this.db.insert(schema.refreshTokens).values({
            userId,
            tokenHash: refreshToken,
            familyId: finalFamilyId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(database_module_1.DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        neon_serverless_1.NeonDatabase])
], AuthService);
//# sourceMappingURL=auth.service.js.map