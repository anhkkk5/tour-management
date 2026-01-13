import locationModel from "../../models/location.model";
// [Get] api/v1/locations
export const listLocations = async () => {
  return locationModel
    .find({
      deleted: false,
    })
    .select("name type");
};
