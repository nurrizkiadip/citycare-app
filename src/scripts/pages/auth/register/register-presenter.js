import { getRegistered } from '../../../data/api';

class RegisterPresenter {
  constructor(view) {
    this._view = view;
  }

  async getRegistered({ name, email, password }) {
    this._view.showLoading('#loader');
    try {
      const response = await getRegistered({ name, email, password });

      this._view.registeredSuccessfully();
      return true;
    } catch (error) {
      console.error('Something went error:', error);
      return false;
    } finally {
      this._view.hideLoading('#loader');
    }
  }
}

export { RegisterPresenter };
