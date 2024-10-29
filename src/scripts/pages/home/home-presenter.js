import { getAllReports } from '../../data/api';
import Leaflet from '../../utils/leaflet';

export class HomePresenter {
  constructor(view) {
    this._view = view;
  }

  async getReports() {
    this._view.showLoading('#loader');
    try {
      const reportsPromises = (await getAllReports()).data.map(async (report) => {
        const placeName = await Leaflet.getPlaceNameByCoordinate(report.location.latitude, report.location.longitude);
        return {
          ...report,
          location: { ...report.location, placeName },
        };
      });
      const reports = await Promise.all(reportsPromises);

      this._view.populateReportsList(reports);
    } catch (error) {
      console.error('Something went error:', error);
      this._view.populateReportsListError();
    } finally {
      this._view.hideLoading('#loader');
    }
  }
}
