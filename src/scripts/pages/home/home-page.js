import {
  generateLoaderAbsoluteTemplate,
  generateReportItemTemplate,
  generateReportsListEmptyTemplate,
  generateReportsListErrorTemplate,
} from '../../templates';
import HomePresenter from './home-presenter';
import Leaflet from '../../utils/leaflet';
import { MaptilerStyle } from '@maptiler/leaflet-maptilersdk';
import * as CityCareAPI from '../../data/api';

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="reports-list__map__container">
          <div id="map" class="reports-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Laporan Kerusakan</h1>

        <div class="reports-list__container">
          <div id="reports-list"></div>
          <div id="reports-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: CityCareAPI,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  populateReportsList(message, reports) {
    if (reports.length <= 0) {
      this.populateReportsListEmpty();
      return;
    }

    const html = reports.reduce((accumulator, report) => {
      if (this.#map) {
        const coordinate = [report.location.latitude, report.location.longitude];
        const markerOptions = { alt: report.title };
        const popupOptions = { content: report.title };

        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return accumulator.concat(
        generateReportItemTemplate({
          ...report,
          placeNameLocation: report.location.placeName,
          reporterName: report.reporter.name,
        }),
      );
    }, '');

    document.getElementById('reports-list').innerHTML = `
      <div class="reports-list">${html}</div>
    `;
  }

  populateReportsListEmpty() {
    document.getElementById('reports-list').innerHTML = generateReportsListEmptyTemplate();
  }

  populateReportsListError(message) {
    document.getElementById('reports-list').innerHTML = generateReportsListErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Leaflet.build('#map', {
      zoom: 9,
    });

    this.#map.addNewRasterTile(
      'MapTiler',
      'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png',
      {
        attributions:
          '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
      },
    );
    this.#map.addMaptilerTile('MapTiler Vector', MaptilerStyle.STREETS);
    this.#map.addMapTilerGeocoding();
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showLoading() {
    document.getElementById('reports-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('reports-list-loading-container').innerHTML = '';
  }
}
