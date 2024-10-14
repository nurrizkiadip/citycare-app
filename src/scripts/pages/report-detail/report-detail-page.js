import {diffDate, getPosition, showFormattedDate} from '../../utils';
import { ReportDetailPresenter } from './report-detail-presenter';
import { parseActiveUrl } from '../../routes/url-parser';
import Map from '../../utils/map';

export default class ReportDetailPage {
  _map = null;

  render() {
    return `
      <section>
        <div id="report-detail__container" class="report-detail container">  
          <div class="report-detail__header">
            <h2 id="reportdetailtitle" class="report-detail__title">Report Title</h2>
            <div class="report-detail__more-info">
              <div class="report-detail__more-info__inline">
                <div><span id="report-detail-createdat" class="report-detail__createdat"></span></div>
                <div><span id="report-detail-location" class="report-detail__location"></span></div>
              </div>
              <div>Dilaporkan oleh: <span id="reportdetailauthor" class="report-detail__author"></span></div>
            </div>

            <div class="report-detail__damage-level">
              <span class="report-detail__damage-level__minor">Kerusakan Rendah</span>
              <span class="report-detail__damage-level__moderate">Kerusakan Sedang</span>
              <span class="report-detail__damage-level__severe">Kerusakan Berat</span>
            </div>
          </div>

          <img id="reportdetailimage" class="report-detail__image" src="https://ui-avatars.com/api/?name=Image Report&background=random" alt="GAMBAR LAPORAN">

          <div class="report-detail__body">
            <article class="report-detail__description">
              <h3 class="report-detail__description__title">Informasi Lengkap</h3>
              <div id="reportdetaildescription" class="report-detail__description__body">
                INFORMASI LENGKAP LAPORAN
              </div>
            </article>
            <article class="report-detail__map">
              <h3 class="report-detail__map__title">Peta Lokasi</h3>
              <div id="reportdetailmap" class="report-detail__map__body"></div>
            </article>
            <hr>
            <article class="report-detail__comment-form">
              <h3 class="report-detail__comment-form__title">Beri Tanggapan</h3>
              <div class="report-detail__comment-form__form-container">
                <img id="reportdetailcommentformphoto" class="report-detail__comment-form__photo" src="https://ui-avatars.com/api/?name=Unknown User&background=random" alt="Unknown User">
                <form id="reportdetailcommentformform" class="report-detail__comment-form__form">
                  <textarea class="report-detail__comment-form__form__body" name="body" placeholder="Beri tanggapan terkait laporan."></textarea>
                  <button class="report-detail__comment-form__form__submit btn" type="submit">Tanggapi</button>
                </form>
              </div>
            </article>
          </div>
          <div id="reportdetailloader" class="text-center">
            <span class="loader"></span>
          </div>
        </div>
      </section>
      <hr class="report-detail__separator">
      <section>
        <div id="report-detail__comments__container" class="report-detail__comments container">
          <div id="reportdetailcommentslist" class="report-detail__comments-list"></div>
        </div>
        <div id="commentslistloader" class="text-center">
          <span class="loader"></span>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Setup map first before another
    this._setupMap();

    const presenter = new ReportDetailPresenter(this);

    const route = parseActiveUrl();

    await presenter.getReportDetail(route.id);
    await presenter.getReportDetailComments(route.id);

    this._setupCommentForm();
  }

  populateReportDetail(report, userInfo) {
    // Title
    const reportTitle = document.getElementById('reportdetailtitle');
    reportTitle.textContent = report.title;

    // Created at
    const reportCreatedAt = document.getElementById('report-detail-createdat');
    reportCreatedAt.textContent = showFormattedDate(report.createdAt, 'id-ID');

    // Created at
    const reportLocation = document.getElementById('report-detail-location');
    reportLocation.textContent = JSON.stringify(report.location);

    // Author
    const reportAuthor = document.getElementById('reportdetailauthor');
    reportAuthor.textContent = report.userOwner.name;

    // Next to do hiding damage level badge

    // Image
    const reportImage = document.getElementById('reportdetailimage');
    reportImage.src = report.evidenceImages[0];
    reportImage.alt = report.title;

    // Description
    const reportDescription = document.getElementById('reportdetaildescription');
    reportDescription.textContent = report.description.repeat(10);

    // Map
    if (this._map) {
      const reportCoordinate = [report.location.latitude, report.location.longitude];
      this._map.changeCamera(reportCoordinate, 15);

      const markerOptions = {
        alt: report.title,
      };
      const popupOptions = {
        content: report.title,
      };
      this._map.addMarker(reportCoordinate, markerOptions, popupOptions);
    }

    // Report comment form
    const photoCommentForm = document.getElementById('reportdetailcommentformphoto');
    photoCommentForm.src = userInfo.photoUrl;
    photoCommentForm.alt = userInfo.name;
  }

  populateReportDetailComments(comments) {
    const elements = comments.map((comment) => `
      <article class="report-detail__comment-item">
        <img class="report-detail__comment-item__photo" src="${comment.userOwner.photoUrl}" alt="${comment.userOwner.name}">
        <div class="report-detail__comment-item__body">
          <div class="report-detail__comment-item__body__more-info">
            <div class="report-detail__comment-item__body__author">${comment.userOwner.name}</div>
            <div>&middot;</div>
            <div class="report-detail__comment-item__body__createdat">${diffDate(comment.createdAt)} detik yang lalu</div>
          </div>
          <div class="report-detail__comment-item__body__text">${comment.body}</div>
        </div>
      </article>
    `);

    const commentsListContainer = document.getElementById('reportdetailcommentslist');
    commentsListContainer.innerHTML = elements.join('');
  }

  async _setupMap() {
    this._map = await Map.build('#reportdetailmap');
  }

  _setupCommentForm() {
    const form = document.getElementById('reportdetailcommentformform');
    const body = form.elements.namedItem('body');
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      console.log(body.value);
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
