"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Ticketing API')
        .setDescription('The Event Ticket Booking System API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map