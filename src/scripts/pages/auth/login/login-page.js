import { LoginPresenter } from './login-presenter';

export default class LoginPage {
  _presenter = null;
  _form = null;

  render() {
    return `
      <section>
        <div class="login__container">
          <div class="login__hero">
            <h2 class="login__title">Login</h2>
          </div>
        </div>
      </section>

      <section>
        <div class="login-form__container container">
          <div id="loader" class="loader"></div>

          <form id="login-form" class="login-form">
            <div class="form-control">
              <label for="login-form-email-input" class="login-form__email-title">Email</label>

              <div class="login-form__title-container">
                <input id="login-form-email-input" type="email" name="email" placeholder="johndoe@gmail.com">
              </div>
            </div>
            <div class="form-control">
              <label for="login-form-password-input" class="login-form__password-title">Password</label>

              <div class="login-form__title-container">
                <input id="login-form-password-input" type="password" name="password" placeholder="********">
              </div>
            </div>
            <div class="form-buttons">
              <button class="btn" type="submit">Masuk</button>
              <span>Belum punya akun? <a href="#/register">Register</a></span>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.hideLoading('#loader');

    this._form = document.getElementById('login-form');
    this._presenter = new LoginPresenter(this);

    await this._setupForm();
  }

  async _setupForm() {
    const email = this._form.elements.namedItem('email');
    const password = this._form.elements.namedItem('password');

    this._form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const body = {
        email: email.value,
        password: password.value,
      };

      await this._presenter.getLogin(body);
    });
  }

  loginSuccessfully() {
    window.location.hash = '/';
  }

  showLoading(selector) {
    const loader = document.querySelector(selector);
    loader.style.display = 'block';
  }

  hideLoading(selector) {
    const loader = document.querySelector(selector);
    loader.style.display = 'none';
  }
}
