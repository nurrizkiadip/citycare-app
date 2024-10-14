import {getAllBookmarkedReports} from "../../data/api";

class BookmarkPresenter {
  constructor(view) {
    this._view = view;
  }

  async getBookmarkedReports() {
    this._view.showLoading();
    try {
      const response = await getAllBookmarkedReports();
      this._view.populateReports(response.data);
    } catch (error) {
      console.error('Something went error:', error);
    } finally {
      this._view.hideLoading();
    }
  }
}

export { BookmarkPresenter };
