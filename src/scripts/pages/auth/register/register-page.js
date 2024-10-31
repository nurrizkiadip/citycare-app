import { RegisterPresenter } from './register-presenter';

export default class RegisterPage {
  _presenter = null;
  _form = null;

  render() {
    return `
      <section class="register-container">
        <div class="register-form-container">
          <h2 class="register__title">Daftar akun</h2>
          <div id="loader" class="loader"></div>

          <form id="register-form" class="register-form">
            <div class="form-control">
              <label for="register-form-name-input" class="register-form__name-title">Nama lengkap</label>

              <div class="register-form__title-container">
                <input id="register-form-name-input" type="text" name="name" placeholder="Masukkan nama lengkap Anda">
              </div>
            </div>
            <div class="form-control">
              <label for="register-form-email-input" class="register-form__email-title">Email</label>

              <div class="register-form__title-container">
                <input id="register-form-email-input" type="email" name="email" placeholder="Contoh: nama@email.com">
              </div>
            </div>
            <div class="form-control">
              <label for="register-form-password-input" class="register-form__password-title">Password</label>

              <div class="register-form__title-container">
                <input id="register-form-password-input" type="password" name="password" placeholder="Masukkan password baru">
              </div>
            </div>
            <div class="form-buttons register-form__form-buttons">
              <button class="btn" type="submit">Daftar akun</button>
              <p class="register-form__already-have-account">Sudah punya akun? <a href="#/login">Masuk</a></p>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.hideLoading('#loader');

    this._form = document.getElementById('register-form');
    this._presenter = new RegisterPresenter(this);

    await this._setupForm();
  }

  async _setupForm() {
    const name = this._form.elements.namedItem('name');
    const email = this._form.elements.namedItem('email');
    const password = this._form.elements.namedItem('password');

    this._form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const body = {
        name: name.value,
        email: email.value,
        password: password.value,
      };

      /**
       * review:
       * jangan lupa dihapus karena email dan password akan terlihat
       */
      window.alert(JSON.stringify(body));
      await this._presenter.getRegistered(body);
    });
  }

  registeredSuccessfully(message) {
    window.alert(message);
    window.location.hash = '/login';
  }

  registeredFailed(message) {
    window.alert(message);
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
