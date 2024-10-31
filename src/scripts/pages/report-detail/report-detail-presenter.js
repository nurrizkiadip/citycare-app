import {
  getAllCommentsByReportId,
  getReportById, sendCommentToReportOwnerViaNotification, sendReportToMeViaNotification,
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
      const response = await getReportById(this._reportId);

      if (!response.ok) {
        console.error('getReportDetail: response:', response);
        this._view.populateReportDetailError(response.message);
        return;
      }

      const { latitude, longitude } = response.data.location;
      const report = {
        ...response.data,
        location: {
          ...response.data.location,
          placeName: await Leaflet.getPlaceNameByCoordinate(latitude, longitude),
        },
      };

      /**
       * review:
       * missing await?
       */
      this._view.populateReportDetail(response.message, report);
    } catch (error) {
      console.error('getReportDetail: error:', error);
      this._view.populateReportDetailError(error.message);
    } finally {
      this._view.hideLoading('#report-detail-loader');
    }
  }

  async getCommentsList() {
    this._view.showLoading('#report-detail-comments-list-loader');
    try {
      const response = await getAllCommentsByReportId(this._reportId);
      this._view.populateReportDetailComments(response.message, response.data);
    } catch (error) {
      console.error('getCommentsList: error:', error);
      this._view.populateCommentsListError(error.message);
    } finally {
      this._view.hideLoading('#report-detail-comments-list-loader');
    }
  }

  async postNewComment({ body }) {
    this._view.disableCommentSubmit();
    this._view.showLoading('#report-detail-comments-form-loader');
    try {
      const response = await storeNewCommentByReportId(this._reportId, { body });

      if (!response.ok) {
        console.error('postNewComment: response:', response);
        this._view.postNewCommentFailed(response.message);
        return;
      }

      /**
       * review:
       * missing await?
       */
      this.notifyReportOwner(response.data.id);
      this._view.postNewCommentSuccessfully(response.message, response.data);
    } catch (error) {
      console.error('postNewComment: error:', error);
      this._view.postNewCommentFailed(error.message);
    } finally {
      this._view.enableCommentSubmit();
      this._view.hideLoading('#report-detail-comments-form-loader');
    }
  }

  async notifyReportOwner(commentId) {
    try {
      const response = await sendCommentToReportOwnerViaNotification(this._reportId, commentId);

      if (!response.ok) {
        console.error('notifyReportOwner: response:', response);
        return;
      }

      console.log('notifyReportOwner:', response.message);
    } catch (error) {
      console.error('notifyReportOwner: error:', error);
    }
  }

  async notifyMe() {
    try {
      const response = await sendReportToMeViaNotification(this._reportId);

      if (!response.ok) {
        console.error('notifyMe: response:', response);
        return;
      }

      console.log('notifyMe:', response.message);
    } catch (error) {
      console.error('notifyMe: error:', error);
    }
  }

  async saveReport({ id, title, damageLevel, description, evidenceImages, location, reporter, createdAt, updatedAt }) {
    try {
      const data = {
        id, title, damageLevel, description,
        evidenceImages, location, reporter,
        createdAt, updatedAt,
      };
      await putReport(data);
      this._view.saveToBookmarkSuccessfully('Success to save to bookmark');
    } catch (error) {
      console.error('saveReport: error:', error);
      this._view.saveToBookmarkFailed(error.message);
    }
  }

  async removeReport(reportId) {
    try {
      await removeReport(reportId);
      this._view.removeFromBookmarkSuccessfully('Success to remove from bookmark');
    } catch (error) {
      console.error('removeReport: error:', error);
      this._view.removeFromBookmarkFailed(error.message);
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
