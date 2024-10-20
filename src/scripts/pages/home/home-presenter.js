import { getAllReports } from '../../data/api';

class HomePresenter {
  constructor(view) {
    this._view = view;
  }

  async getReports() {
    this._view.showLoading('#loader');
    try {
      const response = await getAllReports();

      this._view.populateReportsList(response.data);
    } catch (error) {
      console.error('Something went error:', error);
      this._view.populateReportsListError();
    } finally {
      this._view.hideLoading('#loader');
    }
  }
}

export { HomePresenter };
