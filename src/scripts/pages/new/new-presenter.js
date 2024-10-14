import {getAllCommentsByReportId, getMyUserInfo, getReportById} from '../../data/api';

class NewPresenter {
  constructor(view) {
    this._view = view;
  }

  async getReportDetail(id) {
    this._view.showLoading('reportdetailloader');
    try {
      const reportResponse = await getReportById(id);
      const userInfoResponse = await getMyUserInfo();
      this._view.populateReportDetail(reportResponse.data, userInfoResponse.data);
    } catch (error) {
      console.error('Something went error:', error);
    } finally {
      this._view.hideLoading('reportdetailloader');
    }
  }

  async getReportDetailComments(reportId) {
    this._view.showLoading('commentslistloader');
    try {
      const response = await getAllCommentsByReportId(reportId);
      this._view.populateReportDetailComments(response.data);
    } catch (error) {
      console.error('Something went error:', error);
    } finally {
      this._view.hideLoading('commentslistloader');
    }
  }
}

export { NewPresenter };
