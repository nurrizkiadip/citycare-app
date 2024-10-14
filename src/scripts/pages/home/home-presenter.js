import { getAllReports } from '../../data/api';

class HomePresenter {
  constructor(view) {
    this._view = view;
  }

  async getReports() {
    this._view.showLoading();
    try {
      const response = await getAllReports();

      this._view.populateReports(response.data);
    } catch (error) {
      console.error('Something went error:', error);
    } finally {
      this._view.hideLoading();
    }
  }
}

export { HomePresenter };
