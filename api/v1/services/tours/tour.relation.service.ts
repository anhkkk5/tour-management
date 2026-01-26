import TopicTour from "../../models/topicTour/topicTour.model";
import Location from "../../models/location/location.model";
import { toObjectIdMaybe } from "../../../../utils/mongo.util";

export const loadTourRelations = async (tourObj: any) => {
  const topicTourId = toObjectIdMaybe(tourObj.topicTourId);
  const departureId = toObjectIdMaybe(tourObj.departureId);

  const destinationIds = Array.isArray(tourObj.destinationIds)
    ? tourObj.destinationIds.map(toObjectIdMaybe).filter(Boolean)
    : [];

  const [topicTour, departure, destinations] = await Promise.all([
    topicTourId ? TopicTour.findById(topicTourId) : null,
    departureId ? Location.findById(departureId) : null,
    destinationIds.length
      ? Location.find({ _id: { $in: destinationIds } })
      : [],
  ]);

  return { topicTour, departure, destinations };
};
