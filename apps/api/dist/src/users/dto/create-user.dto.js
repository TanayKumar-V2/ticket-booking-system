"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserSchema = void 0;
const zod_1 = require("zod");
const schema_1 = require("../../db/schema");
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    passwordHash: zod_1.z.string(),
    role: zod_1.z.enum(schema_1.roleEnum.enumValues).optional(),
});
//# sourceMappingURL=create-user.dto.js.map