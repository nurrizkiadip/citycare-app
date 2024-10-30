import { getRegistered } from '../../../data/api';

class RegisterPresenter {
  constructor(view) {
    this._view = view;
  }

  async getRegistered({ name, email, password }) {
    this._view.showLoading('#loader');
    try {
      const response = await getRegistered({ name, email, password });

      if (!response.ok) {
        console.error('getRegistered: response:', response);
        this._view.registeredFailed(response.message);
        return;
      }

      this._view.registeredSuccessfully(response.message, response.data);
    } catch (error) {
      console.error('getRegistered: error:', error);
      this._view.registeredFailed(error.message);
    } finally {
      this._view.hideLoading('#loader');
    }
  }
}

export { RegisterPresenter };
