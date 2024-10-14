import { HomePresenter } from './home-presenter';
import { showFormattedDate } from '../../utils';
import Map from '../../utils/map';

export default class HomePage {
  _reports = [];

  render() {
    return `
      <section class="map">
        <div id="reportsmap" class="reports-map"></div>
      </section>

      <section class="report">
        <div class="container">
          <h2 class="section-title">All Reports</h2>

          <div id="reportslist" class="reports-list"></div>
          <div id="loader" class="text-center">
            <span class="loader"></span>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Setup map first before another
    this._setupMap();

    const presenter = new HomePresenter(this);

    await presenter.getReports();
  }

  populateReports(reports) {
    this._reports = reports;

    const elements = this._reports.map((report) => {
      return `
        <div class="report-item">
          <img class="report-item__image" src="${report.evidenceImages[0]}" alt="${report.title}">
          <div class="report-item__body">
            <div class="report-item__body-header">
              <h2 id="reporttitle" class="report-item__body-header__title">${report.title}</h2>
              <div class="report-item__header__more-info">
                <div class="report-item__createdAt">${showFormattedDate(report.createdAt, 'id-ID')}</div>
                <div class="report-item__location">${'Bandung'}</div>
              </div>
            </div>
            <div id="reportdescription" class="report-item__body__description">${report.description}</div>
            <a class="report-item__body__read-more" href="#/reports/${report.id}">Selengkapnya</a>
          </div>
        </div>
      `;
    });

    const musicListContainer = document.getElementById('reportslist');
    musicListContainer.innerHTML = elements.join('');

    if (this._map) {
      this._reports.forEach((report) => {
        const coordinate = [report.location.latitude, report.location.longitude];
        const markerOptions = {
          alt: report.title,
        };
        const popupOptions = {
          content: report.title,
        };
        this._map.addMarker(coordinate, markerOptions, popupOptions);
      });
    }
  }

  async _setupMap() {
    this._map = await Map.build('#reportsmap');
  }

  showLoading() {
    const musicsLoader = document.getElementById('loader');
    musicsLoader.style.display = 'block';
  }

  hideLoading() {
    const musicsLoader = document.getElementById('loader');
    musicsLoader.style.display = 'none';
  }
}
