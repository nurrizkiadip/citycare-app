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

      if (!response.ok) {
        console.error('getLogin: response:', response);
        this._view.loginFailed(response.message);
        return;
      }

      putAccessToken(response.data.accessToken);

      this._view.loginSuccessfully(response.message, response.data);
    } catch (error) {
      console.error('getLogin: error:', error);
      this._view.loginFailed(error.message);
    } finally {
      this._view.hideLoading('#loader');
    }
  }
}

export { LoginPresenter };
