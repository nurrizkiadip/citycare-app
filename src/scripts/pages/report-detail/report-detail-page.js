import {
  generateRemoveReportButtonTemplate,
  generateReportCommentItemTemplate,
  generateReportDetailImageTemplate,
  generateSaveReportButtonTemplate
} from '../../utils/templates';
import {createCarousel, generateDamageLevelBadge, getPlaceNameByCoordinate, showFormattedDate,} from '../../utils';
import {ReportDetailPresenter} from './report-detail-presenter';
import {parseActiveUrl} from '../../routes/url-parser';
import Leaflet from '../../utils/leaflet';

export default class ReportDetailPage {
  _presenter = null;
  _map = null;

  render() {
    return `
      <section class="report-detail-container">
        <div class="report-detail__header">
          <h2 id="report-detail-title" class="report-detail__title">
            REPORT TITLE
          </h2>

          <div class="report-detail__more-info">
            <div class="report-detail__more-info__inline">
              <div id="report-detail-createdat" class="report-detail__createdat"><i class="fas fa-calendar-alt"></i></div>
              <div id="report-detail-location-place-name" class="report-detail__location__place-name"><i class="fas fa-map"></i></div>
            </div>
            <div class="report-detail__more-info__inline">
              <div id="report-detail-location-latitude" class="report-detail__location__latitude">Latitude:</div>
              <div id="report-detail-location-longitude" class="report-detail__location__longitude">Longitude:</div>
            </div>
            <div id="report-detail-author" class="report-detail__author">Dilaporkan oleh:</div>
          </div>

          <div id="report-detail-damage-level" class="report-detail__damage-level"></div>
        </div>

        <div class="report-detail__body-container container">
          <div id="report-detail-images" class="report-detail__images">
            ${generateReportDetailImageTemplate()}
          </div>

          <div class="report-detail__body">
            <article class="report-detail__description-container">
              <h3 class="report-detail__description__title">Informasi Lengkap</h3>
              <div id="report-detail-description" class="report-detail__description__body">
                INFORMASI LENGKAP LAPORAN
              </div>
            </article>
            <article class="report-detail__map-container">
              <h3 class="report-detail__map__title">Peta Lokasi</h3>
              <div id="report-detail-map" class="report-detail__map"></div>
            </article>
            <hr>
            <article class="report-detail__actions-container">
              <div>Aksi</div>
              <div id="report-detail-actions"></div>
            </article>
          </div>
        </div>
        <div id="report-detail-loader" class="loader"></div>
      </section>
      
      <section class="container">
        <hr>
        <div class="report-detail__comments-container">
          <article class="report-detail__comments-form-container">
            <h3 class="report-detail__comment-form__title">Beri Tanggapan</h3>
            <form id="report-detail-comment-form-form" class="report-detail__comment-form__form">
              <textarea name="body" placeholder="Beri tanggapan terkait laporan."></textarea>
              <button id="report-detail-comments-form-submit" class="btn" type="submit">
                <i id="report-detail-comments-form-loader" class="report-detail__comments-form__loader fas fa-spinner"></i>
                Tanggapi
              </button>
            </form>
          </article>
          <hr>
          <article class="report-detail__comments-list-container">
            <div id="report-detail-comments-list" class="report-detail__comments-list"></div>
            <div id="report-detail-comments-list-empty" class="report-detail__comments-list__empty"></div>
            <div id="report-detail-comments-list-error" class="report-detail__comments-list__error"></div>
            <div id="report-detail-comments-list-loader" class="loader"></div>
          </article>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.hideLoading('#report-detail-loader');
    this.hideLoading('#report-detail-comments-form-loader');

    const route = parseActiveUrl();
    this._presenter = new ReportDetailPresenter(this, route.id);

    await this._setupMap();
    this._setupCommentForm();

    await this._presenter.getReportDetail();
    await this._presenter.getCommentsList();
  }

  async populateReportDetail(report) {
    if (typeof report !== 'object') {
      throw new Error('reports must be an object');
    }

    this._presenter.renderBookmarkButton(report);

    // Title
    const reportTitle = document.getElementById('report-detail-title');
    reportTitle.textContent = report.title;

    // Created at
    const reportCreatedAt = document.getElementById('report-detail-createdat');
    reportCreatedAt.dataset.value = showFormattedDate(report.createdAt, 'id-ID');

    // Location
    const reportLocationLatitude = document.getElementById('report-detail-location-latitude');
    reportLocationLatitude.dataset.value = JSON.stringify(report.location.latitude);
    const reportLocationLongitude = document.getElementById('report-detail-location-longitude');
    reportLocationLongitude.dataset.value = JSON.stringify(report.location.longitude);
    const reportLocationPlaceName = document.getElementById('report-detail-location-place-name');
    reportLocationPlaceName.dataset.value = report.location.placeName;

    // Author
    const reportAuthor = document.getElementById('report-detail-author');
    reportAuthor.dataset.value = report.userOwner.name;

    // Damage level badge
    const reportDamageLevel = document.querySelector('#report-detail-damage-level');
    reportDamageLevel.innerHTML = generateDamageLevelBadge(report.damageLevel);

    // Image
    const reportImages = document.getElementById('report-detail-images');
    reportImages.innerHTML = report.evidenceImages
      .map((evidenceImage) => generateReportDetailImageTemplate(evidenceImage, report.title))
      .join('');
    createCarousel(reportImages);

    // Description
    const reportDescription = document.getElementById('report-detail-description');
    reportDescription.textContent = report.description;

    // Map
    if (this._map) {
      const reportCoordinate = [report.location.latitude, report.location.longitude];
      this._map.changeCamera(reportCoordinate);

      const markerOptions = {
        alt: report.title,
      };
      const popupOptions = {
        content: report.title,
      };
      this._map.addMarker(reportCoordinate, markerOptions, popupOptions);
    }
  }

  populateReportDetailError() {
    window.alert('Terjadi kesalahan mendapatkan detail laporan kerusakan, nih.');
  }

  populateReportDetailComments(comments) {
    if (!Array.isArray(comments)) {
      throw new Error('comments must be an array');
    }

    if (comments.length <= 0) {
      const reportsListEmpty = document.getElementById('report-detail-comments-list-empty');
      reportsListEmpty.innerHTML = 'Daftar komentar laporan sedang kosong, nih.';
      reportsListEmpty.style.display = 'block';

      return;
    }

    const elements = comments.map((comment) => generateReportCommentItemTemplate(comment));

    const commentsListContainer = document.getElementById('report-detail-comments-list');
    commentsListContainer.innerHTML = elements.join('');
  }

  populateCommentsListError() {
    const reportsListError = document.getElementById('report-detail-comments-list-error');
    reportsListError.innerHTML = 'Terjadi kesalahan, nih.';
    reportsListError.style.display = 'block';
  }

  async _setupMap() {
    this._map = await Leaflet.build('#report-detail-map', {
      zoom: 15,
    });

    this._map.addNewRasterTile('MapTiler', 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=L1V7oYaAoswTHnKhMMJ8', {
      attributions: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    });
    this._map.addMaptilerTile('MapTiler Vector');
  }

  _setupCommentForm() {
    const form = document.getElementById('report-detail-comment-form-form');
    const body = form.elements.namedItem('body');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      await this._presenter.postNewComment({
        body: body.value,
      });
    });
  }

  postNewCommentSuccessfully() {
    console.log('Success storing new comment');
  }

  async renderSaveButton(report) {
    const actions = document.getElementById('report-detail-actions');
    actions.innerHTML = generateSaveReportButtonTemplate();

    document.querySelector('#report-detail-save').addEventListener('click', async () => {
      await this._presenter.saveReport(report);
      await this._presenter.renderBookmarkButton(report);
    });
  }

  async renderRemoveButton(report) {
    const actions = document.getElementById('report-detail-actions');
    actions.innerHTML = generateRemoveReportButtonTemplate();

    document.querySelector('#report-detail-remove').addEventListener('click', async () => {
      await this._presenter.removeReport(report.id);
      await this._presenter.renderBookmarkButton(report);
    });
  }

  saveToBookmarkSuccessfully() {
    window.alert('Saving from bookmark was success');
    console.log('Saving from bookmark was success');
  }

  removeFromBookmarkSuccessfully() {
    window.alert('Removing from bookmark was success');
    console.log('Removing from bookmark was success');
  }

  showLoading(selector) {
    const loader = document.querySelector(selector);
    loader.style.display = 'block';
  }

  hideLoading(selector) {
    const loader = document.querySelector(selector);
    loader.style.display = 'none';
  }

  enableCommentSubmit() {
    const submit = document.querySelector('#report-detail-comments-form-submit');
    submit.disabled = false;
  }

  disableCommentSubmit() {
    const submit = document.querySelector('#report-detail-comments-form-submit');
    submit.disabled = true;
  }
}
