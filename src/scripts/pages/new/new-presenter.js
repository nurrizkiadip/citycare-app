import {
  sendReportToAllUserViaNotification,
  storeNewReport
} from '../../data/api';

class NewPresenter {
  constructor(view) {
    this._view = view;
  }

  async postNewReport({ title, damageLevel, description, evidenceImages, latitude, longitude }) {
    this._view.showLoading('#new-report-loader');
    try {
      const data = {
        title: title,
        damageLevel: damageLevel,
        description: description,
        evidenceImages: evidenceImages,
        latitude: latitude,
        longitude: longitude,
      };

      const response = await storeNewReport(data);

      if (!response.ok) {
        console.error('postNewReport: response:', response);
        this._view.storeFailed(response.message);
        return;
      }

      this._notifyToAllUser(response.data.id);
      this._view.storeSuccessfully(response.message, response.data);
    } catch (error) {
      console.error('postNewReport: error:', error);
      this._view.storeFailed(error.message);
    } finally {
      this._view.hideLoading('#new-report-loader');
    }
  }

  async _notifyToAllUser(reportId) {
    try {
      const response = await sendReportToAllUserViaNotification(reportId);

      if (!response.ok) {
        console.error('_notifyToAllUser: response:', response);
        return;
      }

      console.log('_notifyToAllUser:', response.message);
    } catch (error) {
      console.error('_notifyToAllUser: error:', error);
    }
  }
}

export { NewPresenter };
