"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentGymId = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentGymId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.gymId;
});
//# sourceMappingURL=tenant.decorator.js.map