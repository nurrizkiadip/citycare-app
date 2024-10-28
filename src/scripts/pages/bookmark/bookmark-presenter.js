import { getAllReports } from '../../data/database';

export class BookmarkPresenter {
  constructor(view) {
    this._view = view;
  }

  async getAllBookmarkedReports() {
    this._view.showLoading('#loader');
    try {
      const reports = await getAllReports();
      this._view.populateReportsList(reports);
    } catch (error) {
      console.error('Something went error:', error);
      this._view.populateReportsListError();
    } finally {
      this._view.hideLoading('#loader');
    }
  }
}
