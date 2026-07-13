"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("./db/database.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const throttler_1 = require("@nestjs/throttler");
const events_module_1 = require("./events/events.module");
const seats_module_1 = require("./seats/seats.module");
const bookings_module_1 = require("./bookings/bookings.module");
const bullmq_1 = require("@nestjs/bullmq");
const core_1 = require("@nestjs/core");
const roles_guard_1 = require("./common/guards/roles.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            events_module_1.EventsModule,
            seats_module_1.SeatsModule,
            bookings_module_1.BookingsModule,
            bullmq_1.BullModule.forRoot({
                connection: {
                    url: process.env.REDIS_URL || 'redis://localhost:6379',
                },
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
        ],
        controllers: [],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            }
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map