import { storeNewReport } from '../../data/api';

class NewPresenter {
  constructor(view) {
    this._view = view;
  }

  async postNewReport({ title, damageLevel, description, evidenceImages, latitude, longitude }) {
    this._view.showLoading('#new-report-loader');
    try {
      const response = await storeNewReport({
        title: title.value,
        damageLevel: damageLevel.value,
        description: description.value,
        evidenceImages: evidenceImages,
        location: {
          latitude: latitude.value,
          longitude: longitude.value,
        },
      });

      this._view.storeSuccessfully(response);
    } catch (error) {
      console.error('Something went error:', error);
    } finally {
      this._view.hideLoading('#new-report-loader');
    }
  }
}

export { NewPresenter };
