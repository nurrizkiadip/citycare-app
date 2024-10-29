import {
  getAllCommentsByReportId,
  getReportById,
  storeNewCommentByReportId,
} from '../../data/api';
import {
  getReportById as getSavedReportById,
  putReport,
  removeReport,
} from '../../data/database';
import Leaflet from '../../utils/leaflet';

class ReportDetailPresenter {
  _reportId = null;

  constructor(view, reportId) {
    this._view = view;
    this._reportId = reportId;
  }

  async getReportDetail() {
    this._view.showLoading('#report-detail-loader');
    try {
      const { data } = await getReportById(this._reportId);
      const placeName = await Leaflet.getPlaceNameByCoordinate(data.location.latitude, data.location.longitude);
      const report = {
        ...data,
        location: { ...data.location, placeName },
      };

      this._view.populateReportDetail(report);
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

  async saveReport({ id, title, damageLevel, description, evidenceImages, location, userOwner, createdAt, updatedAt }) {
    try {
      const data = {
        id, title, damageLevel, description,
        evidenceImages, location, userOwner,
        createdAt, updatedAt,
      };
      await putReport(data);
      this._view.saveToBookmarkSuccessfully();
    } catch (error) {
      console.error('Something went error:', error);
    }
  }

  async removeReport(reportId) {
    try {
      await removeReport(reportId);
      this._view.removeFromBookmarkSuccessfully();
    } catch (error) {
      console.error('Something went error:', error);
    }
  }

  async renderBookmarkButton(report) {
    if (await this._isReportExist(report.id)) {
      await this._view.renderRemoveButton(report);
      return;
    }

    await this._view.renderSaveButton(report);
  }

  async _isReportExist(id) {
    return !!(await getSavedReportById(id));
  }
}

export { ReportDetailPresenter };
