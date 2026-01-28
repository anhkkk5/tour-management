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
exports.deletePolicy = exports.updatePolicy = exports.createPolicy = exports.getPolicy = exports.listPolicies = void 0;
const utility_functions_1 = require("../../../../helpers/utility_functions");
const policyService = __importStar(require("../../services/tours/tour.policy.crud.service"));
const listPolicies = async (req, res) => {
    const policies = await policyService.listTourPolicies();
    return res.json({
        code: 200,
        data: policies,
    });
};
exports.listPolicies = listPolicies;
const getPolicy = async (req, res) => {
    const id = (0, utility_functions_1.getParamString)(req, "id");
    if (!id) {
        return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
    }
    const result = await policyService.getTourPolicyById(id);
    if (result.kind === "invalid_id") {
        return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
    }
    if (result.kind === "not_found") {
        return (0, utility_functions_1.sendError)(res, 404, "Tour policy not found");
    }
    return res.json({
        code: 200,
        data: result.policy,
    });
};
exports.getPolicy = getPolicy;
const createPolicy = async (req, res) => {
    try {
        const result = await policyService.createTourPolicy({
            includedServices: req.body?.includedServices,
            excludedServices: req.body?.excludedServices,
            childPolicy: req.body?.childPolicy,
            cancellationPolicy: req.body?.cancellationPolicy,
        });
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        return res.json({
            code: 200,
            message: "Tạo tour policy thành công",
            data: result.policy,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi tạo tour policy!");
    }
};
exports.createPolicy = createPolicy;
const updatePolicy = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await policyService.updateTourPolicyById(id, {
            includedServices: req.body?.includedServices,
            excludedServices: req.body?.excludedServices,
            childPolicy: req.body?.childPolicy,
            cancellationPolicy: req.body?.cancellationPolicy,
        });
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour policy not found");
        }
        if (result.kind === "validation_error") {
            return (0, utility_functions_1.sendError)(res, 400, result.message);
        }
        return res.json({
            code: 200,
            message: "Cập nhật tour policy thành công",
            data: result.policy,
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi cập nhật tour policy!");
    }
};
exports.updatePolicy = updatePolicy;
const deletePolicy = async (req, res) => {
    try {
        const id = (0, utility_functions_1.getParamString)(req, "id");
        if (!id) {
            return (0, utility_functions_1.sendError)(res, 400, "Missing id param");
        }
        const result = await policyService.deleteTourPolicyById(id);
        if (result.kind === "invalid_id") {
            return (0, utility_functions_1.sendError)(res, 400, "Invalid id");
        }
        if (result.kind === "not_found") {
            return (0, utility_functions_1.sendError)(res, 404, "Tour policy not found");
        }
        return res.json({
            code: 200,
            message: "Xóa tour policy thành công",
        });
    }
    catch (error) {
        return (0, utility_functions_1.sendError)(res, 500, "Lỗi khi xóa tour policy!");
    }
};
exports.deletePolicy = deletePolicy;
