import { LoginPresenter } from './login-presenter';

export default class LoginPage {
  /**
   * review:
   * kenapa tidak mulai mengajarkan syntax baru # untuk private property?
   */
  _presenter = null;
  _form = null;

  render() {
    return `
      <section class="login-container">
        <div class="login-form-container">
          <h2 class="login__title">Masuk akun</h2>
          <div id="loader" class="loader"></div>

          <form id="login-form" class="login-form">
            <div class="form-control">
              <label for="login-form-email-input" class="login-form__email-title">Email</label>

              <div class="login-form__title-container">
                <input id="login-form-email-input" type="email" name="email" placeholder="Contoh: nama@email.com">
              </div>
            </div>
            <div class="form-control">
              <label for="login-form-password-input" class="login-form__password-title">Password</label>

              <div class="login-form__title-container">
                <input id="login-form-password-input" type="password" name="password" placeholder="Masukkan password Anda">
              </div>
            </div>
            <div class="form-buttons login-form__form-buttons">
              <button class="btn" type="submit">Masuk</button>
              <p class="login-form__do-not-have-account">Belum punya akun? <a href="#/register">Daftar</a></p>
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

  loginSuccessfully(message) {
    window.alert(message);
    window.location.hash = '/';
  }

  loginFailed(message) {
    window.alert(message);
  }

  /**
   * review:
   * mengapa tidak langsung menulis #loader secara langsung, melainkan melalui argumen selector?
   * Berarti presenter yang akan kirim nilainya? Tapi kenapa presenter mengurusi selector yang erat dengan spesifik view.
   */
  showLoading(selector) {
    const loader = document.querySelector(selector);
    loader.style.display = 'block';
  }

  /**
   * review:
   * mengapa tidak langsung menulis #loader secara langsung, melainkan melalui argumen selector?
   * Berarti presenter yang akan kirim nilainya? Tapi kenapa presenter mengurusi selector yang erat dengan spesifik view.
   */
  hideLoading(selector) {
    const loader = document.querySelector(selector);
    loader.style.display = 'none';
  }
}
