"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTourDetailDTO = void 0;
const toTourDetailDTO = (result) => {
    const tour = result?.tour;
    const topicTour = result?.topicTour;
    const departure = result?.departure;
    const destinations = Array.isArray(result?.destinations)
        ? result.destinations
        : [];
    const schedules = Array.isArray(result?.schedules)
        ? result.schedules
        : [];
    const policy = result?.policy;
    return {
        code: 200,
        data: {
            tour: {
                title: tour?.title,
                slug: tour?.slug,
                thumbnail: tour?.thumbnail,
                images: tour?.images ?? [],
                description: tour?.description,
                transportation: tour?.transportation,
                durationDays: tour?.durationDays ?? null,
                itinerary: tour?.itinerary ?? [],
                status: tour?.status,
                notes: tour?.notes,
            },
            topicTour: topicTour
                ? {
                    title: topicTour.title,
                    slug: topicTour.slug,
                    thumbnail: topicTour.thumbnail,
                    description: topicTour.description,
                }
                : null,
            departure: departure
                ? {
                    name: departure.name,
                    slug: departure.slug,
                    type: departure.type,
                }
                : null,
            destinations: destinations.map((d) => ({
                name: d?.name,
                slug: d?.slug,
                type: d?.type,
            })),
            schedules: schedules.map((s) => ({
                startDate: s?.startDate ?? null,
                endDate: s?.endDate ?? null,
                capacity: s?.capacity ?? null,
                bookedSeats: s?.bookedSeats ?? null,
                prices: s?.prices ?? null,
                bookingDeadline: s?.bookingDeadline ?? null,
                notes: s?.notes ?? null,
                deleted: s?.deleted ?? null,
                createdAt: s?.createdAt ?? null,
                updatedAt: s?.updatedAt ?? null,
                availableSeats: s?.availableSeats ??
                    (typeof s?.capacity === "number" && typeof s?.bookedSeats === "number"
                        ? s.capacity - s.bookedSeats
                        : null),
                status: s?.status,
            })),
            policy: policy
                ? {
                    includedServices: policy.includedServices ?? [],
                    excludedServices: policy.excludedServices ?? [],
                    childPolicy: policy.childPolicy ?? null,
                    cancellationPolicy: policy.cancellationPolicy ?? null,
                }
                : null,
        },
    };
};
exports.toTourDetailDTO = toTourDetailDTO;
