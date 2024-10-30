import { getAllReports } from '../../data/database';

export class BookmarkPresenter {
  constructor(view) {
    this._view = view;
  }

  async getAllBookmarkedReports() {
    this._view.showLoading('#loader');
    try {
      const reports = await getAllReports();
      this._view.populateBookmarkedReports('Berhasil mendapatkan daftar laporan tersimpan.', reports);
    } catch (error) {
      console.error('getAllBookmarkedReports: error:', error);
      this._view.populateBookmarkedReportsError(error.message);
    } finally {
      this._view.hideLoading('#loader');
    }
  }
}
