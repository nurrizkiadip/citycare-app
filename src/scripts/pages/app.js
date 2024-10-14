import { parseAndCombineActiveUrl } from '../routes/url-parser';
import routes from '../routes/routes';

class App {
  constructor({ drawerNavigation, drawerButton, content }) {
    this._content = content;
    this._drawerButton = drawerButton;
    this._drawerNavigation = drawerNavigation;

    this.setupDrawer();
  }

  async setupDrawer() {
    try {
      const navListResponse = await fetch('/templates/navbar.html');
      const navListText = await navListResponse.text();

      this._drawerNavigation.innerHTML = navListText;
    } catch (error) {
      console.log('Error:', error);
    } finally {
      this._drawerButton.addEventListener('click', () => {
        this._drawerNavigation.classList.toggle('open');
      });

      document.body.addEventListener('click', (event) => {
        if (!this._drawerNavigation.contains(event.target) && !this._drawerButton.contains(event.target)) {
          this._drawerNavigation.classList.remove('open');
        }
      });
    }
  }

  async renderPage() {
    const url = parseAndCombineActiveUrl();
    let page = routes[url] ?? null;

    if (!page) {
      window.location.hash = '/404';
      page = routes['/404'];
    }

    if (!document.startViewTransition) {
      this._content.innerHTML = page.render();
      await page.afterRender();
      return;
    }

    const transition = document.startViewTransition(async () => {
      this._content.innerHTML = page.render();
      await page.afterRender();
    });

    transition.ready.then(() => {
      console.log('ready');
    });
    transition.finished.then(() => {
      console.log('finished');
    });
    transition.updateCallbackDone.then(() => {
      console.log('updateCallbackDone');
    });
  }
}

export default App;
