import { Request, Response } from "express";
import {
  getParamString,
  sendError,
} from "../../../../helpers/utility_functions";
import * as policyService from "../../services/tours/tour.policy.crud.service";

export const listPolicies = async (req: Request, res: Response) => {
  const policies = await policyService.listTourPolicies();
  return res.json({
    code: 200,
    data: policies,
  });
};

export const getPolicy = async (req: Request, res: Response) => {
  const id = getParamString(req, "id");

  if (!id) {
    return sendError(res, 400, "Missing id param");
  }

  const result = await policyService.getTourPolicyById(id);

  if (result.kind === "invalid_id") {
    return sendError(res, 400, "Invalid id");
  }

  if (result.kind === "not_found") {
    return sendError(res, 404, "Tour policy not found");
  }

  return res.json({
    code: 200,
    data: result.policy,
  });
};

export const createPolicy = async (req: Request, res: Response) => {
  try {
    const result = await policyService.createTourPolicy({
      includedServices: req.body?.includedServices,
      excludedServices: req.body?.excludedServices,
      childPolicy: req.body?.childPolicy,
      cancellationPolicy: req.body?.cancellationPolicy,
    });

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    return res.json({
      code: 200,
      message: "Tạo tour policy thành công",
      data: result.policy,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi tạo tour policy!");
  }
};

export const updatePolicy = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await policyService.updateTourPolicyById(id, {
      includedServices: req.body?.includedServices,
      excludedServices: req.body?.excludedServices,
      childPolicy: req.body?.childPolicy,
      cancellationPolicy: req.body?.cancellationPolicy,
    });

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
      return sendError(res, 404, "Tour policy not found");
    }

    if (result.kind === "validation_error") {
      return sendError(res, 400, result.message);
    }

    return res.json({
      code: 200,
      message: "Cập nhật tour policy thành công",
      data: result.policy,
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi cập nhật tour policy!");
  }
};

export const deletePolicy = async (req: Request, res: Response) => {
  try {
    const id = getParamString(req, "id");

    if (!id) {
      return sendError(res, 400, "Missing id param");
    }

    const result = await policyService.deleteTourPolicyById(id);

    if (result.kind === "invalid_id") {
      return sendError(res, 400, "Invalid id");
    }

    if (result.kind === "not_found") {
      return sendError(res, 404, "Tour policy not found");
    }

    return res.json({
      code: 200,
      message: "Xóa tour policy thành công",
    });
  } catch (error) {
    return sendError(res, 500, "Lỗi khi xóa tour policy!");
  }
};
