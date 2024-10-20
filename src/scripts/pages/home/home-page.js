import { HomePresenter } from './home-presenter';
import Leaflet from '../../utils/leaflet';
import { generateReportItemTemplate } from '../../../templates';

export default class HomePage {
  render() {
    return `
      <section class="map">
        <div id="reports-map" class="reports-map"></div>
      </section>

      <section class="report">
        <div class="container">
          <h2 class="section-title">Daftar Laporan Kerusakan</h2>

          <div id="reports-list" class="reports-list"></div>
          <div id="reports-list-empty" class="reports-list__empty"></div>
          <div id="reports-list-error" class="reports-list__error"></div>
          <div id="loader" class="loader"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const presenter = new HomePresenter(this);

    // Setup map first before another
    await this._setupMap();
    await presenter.getReports();
  }

  populateReportsList(reports) {
    if (!Array.isArray(reports)) {
      throw new Error('reports must be an array');
    }

    if (reports.length <= 0) {
      const reportsListEmpty = document.getElementById('reports-list-empty');
      reportsListEmpty.innerHTML = 'Daftar laporan sedang kosong, nih.';
      reportsListEmpty.style.display = 'block';

      return;
    }

    const elements = reports.map((report) => {
      if (this._map) {
        const coordinate = [report.location.latitude, report.location.longitude];
        const markerOptions = {
          alt: report.title,
        };
        const popupOptions = {
          content: report.title,
        };
        this._map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return generateReportItemTemplate(report);
    });

    const reportsList = document.getElementById('reports-list');
    reportsList.innerHTML = elements.join('');
    reportsList.style.display = 'grid';

    document
      .querySelectorAll('button[data-savereportid]')
      .forEach((button) => button.addEventListener('click', (event) => {
        window.alert('Fitur simpan laporan akan hadir segera!')
      }));
  }

  populateReportsListError() {
    const reportsListError = document.getElementById('reports-list-error');
    reportsListError.innerHTML = 'Terjadi kesalahan, nih.';
    reportsListError.style.display = 'block';
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
