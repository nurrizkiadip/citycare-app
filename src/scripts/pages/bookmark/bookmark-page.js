import Leaflet from '../../utils/leaflet';

export default class BookmarkPage {
  render() {
    return `
      <section class="map">
        <div id="reports-map" class="reports-map"></div>
      </section>

      <section class="report">
        <div class="container">
          <h2 class="section-title">Daftar Laporan Kerusakan Tersimpan</h2>

          <div id="reports-list" class="reports-list"></div>
          <div id="reports-list-empty" class="reports-list__empty"></div>
          <div id="reports-list-error" class="reports-list__error"></div>
          <div id="loader" class="loader"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this._setupMap();

    // Do more things here...
  }

  async _setupMap() {
    this._map = await Leaflet.build('#reports-map', {
      zoom: 8,
    });
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
