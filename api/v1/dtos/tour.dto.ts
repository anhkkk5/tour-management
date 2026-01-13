export const toTourDetailDTO = (result: any) => {
  const tour = result?.tour;
  const topicTour = result?.topicTour;
  const departure = result?.departure;
  const destinations: any[] = Array.isArray(result?.destinations)
    ? result.destinations
    : [];
  const schedules: any[] = Array.isArray(result?.schedules)
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
        price: s?.price ?? null,
        availableSeats: s?.availableSeats ?? null,
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
