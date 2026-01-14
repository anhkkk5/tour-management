import { Request, Response } from "express";
import * as locationService from "../../services/locations/location.service";
// [Get] api/v1/locations
export const index = async (req: Request, res: Response) => {
  const locations = await locationService.listLocations();
  return res.json({
    code: 200,
    data: locations,
  });
};
