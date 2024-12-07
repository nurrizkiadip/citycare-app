import Leaflet from '../utils/leaflet';

export async function reportMapper(report) {
  return {
    ...report,
    location: {
      ...report.location,
      placeName: await Leaflet.getPlaceNameByCoordinate(report.location.latitude, report.location.longitude),
    },
  };
}
