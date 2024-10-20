import { getLogin } from '../../../data/api';
import { putAccessToken } from '../../../utils/auth';

class LoginPresenter {
  constructor(view) {
    this._view = view;
  }

  async getLogin({ email, password }) {
    this._view.showLoading('#loader');
    try {
      const response = await getLogin({ email, password });
      putAccessToken(response.data.token);

      this._view.loginSuccessfully();
      return true;
    } catch (error) {
      console.error('Something went error:', error);
      return false;
    } finally {
      this._view.hideLoading('#loader');
    }
  }
}

export { LoginPresenter };
