import { generateReportItemTemplate } from '../../utils/templates';
import { BookmarkPresenter } from './bookmark-presenter';
import Leaflet from '../../utils/leaflet';

export default class BookmarkPage {
  _presenter = null;
  _map = null;

  render() {
    return `
      <section class="map">
        <div id="reports-map" class="reports-map"></div>
      </section>

      <section class="container">
        <h2 class="section-title">Daftar Laporan Kerusakan Tersimpan</h2>

        <div id="reports" class="reports"></div>
        <div id="loader" class="loader"></div>
      </section>
    `;
  }

  async afterRender() {
    this._presenter = new BookmarkPresenter(this);

    // Setup map first before another
    await this._setupMap();

    await this._presenter.getAllBookmarkedReports();
  }

  populateBookmarkedReports(message, reports) {
    if (!Array.isArray(reports)) {
      throw new Error('reports must be an array');
    }

    if (reports.length <= 0) {
      document.getElementById('reports').innerHTML = `
        <div id="reports-list-empty" class="reports-list__empty">
          Daftar laporan tersimpan sedang kosong, nih.
        </div>
      `;

      return;
    }

    const html = reports.map((report) => {
      if (this._map) {
        const coordinate = [report.location.latitude, report.location.longitude];
        const markerOptions = { alt: report.title };
        const popupOptions = { content: report.title };
        this._map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return generateReportItemTemplate(report);
    }).join('');

    document.getElementById('reports').innerHTML = `
      <div id="reports-list" class="reports-list">
        ${html}
      </div>
    `;
  }

  populateBookmarkedReportsError(message) {
    document.getElementById('reports').innerHTML = `
      <div id="reports-list-error" class="reports-list__error">
        Terjadi kesalahan mengambil daftar laporan tersimpan, nih.<br>
        ${message}
      </div>
    `;
  }

  async _setupMap() {
    this._map = await Leaflet.build('#reports-map', {
      zoom: 8,
    });

    this._map.addNewRasterTile('MapTiler', 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=L1V7oYaAoswTHnKhMMJ8', {
      attributions: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    });
    this._map.addMaptilerTile('MapTiler Vector');
    this._map.addMapTilerGeocoding();
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
