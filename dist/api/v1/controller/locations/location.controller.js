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
Object.defineProperty(exports, "__esModule", { value: true });
exports.restore = exports.remove = exports.update = exports.create = exports.detail = exports.listDeleted = exports.index = void 0;
const locationService = __importStar(require("../../services/locations/location.service"));
const utility_functions_1 = require("../../../../helpers/utility_functions");
const index = async (req, res) => {
    const locations = await locationService.listLocations();
    return res.json({
        code: 200,
        data: locations,
    });
};
exports.index = index;
const listDeleted = async (req, res) => {
    const locations = await locationService.getDeletedLocations();
    return res.json({
        code: 200,
        data: locations,
    });
};
exports.listDeleted = listDeleted;
const detail = async (req, res) => {
    const id = (0, utility_functions_1.getParamString)(req, "id");
    if (!id) {
        return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
    }
    const result = await locationService.getLocationById(id);
    if (result.kind === "invalid_id") {
        return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
    }
    if (result.kind === "not_found") {
        return (0, utility_functions_1.sendError)(res, 404, "Location not found");
    }
    return res.json({
        code: 200,
        data: result.location,
    });
};
exports.detail = detail;
const create = async (req, res) => {
    try {
        const result = await locationService.createLocation({
            name: req.body?.name,
            type: req.body?.type,
        });
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        if (result.kind === "duplicate_slug") {
            return (0, utility_functions_1.sendError)(res, 409, "Location slug already exists");
        }
        return res.json({
            code: 200,
            message: "Tạo location thành công",
            data: result.location,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi tạo location!");
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await locationService.updateLocationById(id, {
            name: req.body?.name,
            type: req.body?.type,
        });
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Location not found");
        }
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        if (result.kind === "duplicate_slug") {
            return (0, utility_functions_1.sendError)(res, 409, "Location slug already exists");
        }
        return res.json({
            code: 200,
            message: "Cập nhật location thành công",
            data: result.location,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi cập nhật location!");
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await locationService.softDeleteLocationById(id);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Location not found");
        }
        return res.json({
            code: 200,
            message: "Xóa location thành công",
            data: result.location,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi xóa location!");
    }
};
exports.remove = remove;
const restore = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await locationService.restoreLocationById(id);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Location not found");
        }
        return res.json({
            code: 200,
            message: "Khôi phục location thành công",
            data: result.location,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi khôi phục location!");
    }
};
exports.restore = restore;
