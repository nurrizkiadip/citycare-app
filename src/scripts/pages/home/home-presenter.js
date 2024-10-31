import { getAllReports } from '../../data/api';
import Leaflet from '../../utils/leaflet';

export class HomePresenter {
  constructor(view) {
    this._view = view;
  }

  async getReports() {
    this._view.showLoading('#loader');
    try {
      const response = await getAllReports();

      if (!response.ok) {
        console.error('getReports: response:', response);
        this._view.populateReportsListError(response.message);
        return;
      }

      /**
       * review:
       * agak sulit untuk dibaca, gimana kalo diekstrak ke fungsi terpisah?
       * Jadi harapannya bisa seperti ini
       *
       * const reports = await Promise.all(response.data.map(mapRawReportToReport))
       */
      const reportsPromises = response.data.map(async (report) => ({
        ...report,
        location: {
          ...report.location,
          placeName: await Leaflet.getPlaceNameByCoordinate(report.location.latitude, report.location.longitude),
        },
      }));
      const reports = await Promise.all(reportsPromises);

      this._view.populateReportsList(response.message, reports);
    } catch (error) {
      console.error('getReports: error:', error);
      this._view.populateReportsListError(error.message);
    } finally {
      this._view.hideLoading('#loader');
    }
  }
}
