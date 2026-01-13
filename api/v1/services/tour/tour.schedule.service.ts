import TourSchedule from "../../models/tourSchedule.model";
import { toObjectIdMaybe } from "../../../../utils/mongo.util";

export const getTourSchedules = async (tourObj: any) => {
  const tourId = toObjectIdMaybe(tourObj._id);
  const tourIdStr = tourObj._id?.toString();

  let schedules: any[] = [];

  if (tourId) {
    schedules = await TourSchedule.find({ tourId });
  }

  if (!schedules.length && tourIdStr) {
    schedules = await TourSchedule.collection
      .find({ tourId: tourIdStr })
      .toArray();
  }

  if (
    !schedules.length &&
    (tourObj.price != null || tourObj.availableSeats != null)
  ) {
    schedules = [
      {
        tourId: tourObj._id,
        startDate: null,
        endDate: null,
        price: tourObj.price ?? null,
        availableSeats: tourObj.availableSeats ?? null,
        status: "open",
      },
    ];
  }

  return schedules;
};
