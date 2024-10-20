import { getAllCommentsByReportId, getReportById, storeNewCommentByReportId } from '../../data/api';

class ReportDetailPresenter {
  _reportId = null;

  constructor(view, reportId) {
    this._view = view;
    this._reportId = reportId;
  }

  async getReportDetail() {
    this._view.showLoading('#report-detail-loader');
    try {
      const reportResponse = await getReportById(this._reportId);
      this._view.populateReportDetail(reportResponse.data);
    } catch (error) {
      console.error('Something went error:', error);
      this._view.populateReportDetailError();
    } finally {
      this._view.hideLoading('#report-detail-loader');
    }
  }

  async getCommentsList() {
    this._view.showLoading('#report-detail-comments-list-loader');
    try {
      const response = await getAllCommentsByReportId(this._reportId);
      this._view.populateReportDetailComments(response.data);
    } catch (error) {
      console.error('Something went error:', error);
      this._view.populateCommentsListError();
    } finally {
      this._view.hideLoading('#report-detail-comments-list-loader');
    }
  }

  async postNewComment({ body }) {
    this._view.disableCommentSubmit();
    this._view.showLoading('#report-detail-comments-form-loader');
    try {
      await storeNewCommentByReportId(this._reportId, { body });
      this._view.postNewCommentSuccessfully();
      await this.getCommentsList(this._reportId);
    } catch (error) {
      console.error('Something went error:', error);
    } finally {
      this._view.enableCommentSubmit();
      this._view.hideLoading('#report-detail-comments-form-loader');
    }
  }
}

export { ReportDetailPresenter };
