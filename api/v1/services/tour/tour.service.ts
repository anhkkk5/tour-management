import Tour from "../../models/tour.model";
import { loadTourRelations } from "./tour.relation.service";
import { getTourSchedules } from "./tour.schedule.service";
import { getTourPolicy } from "./tour.policy.service";

export const getTourDetailBySlug = async (slug: string) => {
  const tour = await Tour.findOne({ deleted: false, slug });

  if (!tour) {
    return { kind: "not_found" as const };
  }

  const tourObj = tour.toObject();

  const [relations, schedules, policy] = await Promise.all([
    loadTourRelations(tourObj),
    getTourSchedules(tourObj),
    getTourPolicy(tourObj),
  ]);

  return {
    kind: "ok" as const,
    tour: tourObj,
    ...relations,
    schedules,
    policy,
  };
};
