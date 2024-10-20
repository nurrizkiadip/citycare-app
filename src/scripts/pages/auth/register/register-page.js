import { RegisterPresenter } from './register-presenter';

export default class RegisterPage {
  _presenter = null;
  _form = null;

  render() {
    return `
      <section>
        <div class="register__container">
          <div class="register__hero">
            <h2 class="register__title">Register</h2>
          </div>
        </div>
      </section>

      <section>
        <div class="register-form__container container">
          <div id="loader" class="loader"></div>

          <form id="register-form" class="register-form">
            <div class="form-control">
              <label for="register-form-name-input" class="register-form__name-title">Email</label>

              <div class="register-form__title-container">
                <input id="register-form-name-input" type="text" name="name" placeholder="John Doe">
              </div>
            </div>
            <div class="form-control">
              <label for="register-form-email-input" class="register-form__email-title">Email</label>

              <div class="register-form__title-container">
                <input id="register-form-email-input" type="email" name="email" placeholder="johndoe@gmail.com">
              </div>
            </div>
            <div class="form-control">
              <label for="register-form-password-input" class="register-form__password-title">Password</label>

              <div class="register-form__title-container">
                <input id="register-form-password-input" type="password" name="password" placeholder="********">
              </div>
            </div>
            <div class="form-buttons">
              <button class="btn" type="submit">Daftar</button>
              <span>Sudah punya akun? <a href="#/login">Login</a></span>
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

      window.alert(JSON.stringify(body));
      await this._presenter.getRegistered(body);
    });
  }

  registeredSuccessfully() {
    window.location.hash = '/login';
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
