import { showFormattedDate } from '../scripts/utils';

export function generateMainNavigationList() {
  return `
    <li><a id="report-list-button" class="report-list-button" href="#/">Daftar Laporan</a></li>
    <li><a id="bookmark-button" class="bookmark-button" href="#/bookmark">Laporan Tersimpan</a></li>
  `;
}

export function generateUnauthenticatedNavigationList() {
  return `
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function generateAuthenticatedNavigationList() {
  return `
    <li><a id="new-report-button" class="btn new-report-button" href="#/new">Buat Laporan<i data-feather="plus"></i></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i data-feather="log-out"></i>Logout</a></li>
  `;
}

export function generateReportItemTemplate(report) {
  return `
    <div tabindex="0" class="report-item" data-reportid="${report.id}">
      <div class="report-item__buttons">
        <button class="btn btn-transparent" data-savereportid="${report.id}">
          <i data-feather="bookmark"></i>
        </button>
      </div>
      <img class="report-item__image" src="${report.evidenceImages[0]}" alt="${report.title}">
      <div class="report-item__body">
        <div class="report-item__main">
          <h2 id="report-title" class="report-item__title">${report.title}</h2>
          <div class="report-item__more-info">
            <div class="report-item__createdAt"><i data-feather="calendar"></i>${showFormattedDate(report.createdAt, 'id-ID')}</div>
            <div class="report-item__location"><i data-feather="map"></i>${Object.values(report.location)}</div>
          </div>
        </div>
        <div id="report-description" class="report-item__body__description">${report.description}</div>
        <div class="report-item__more-info">
          <div class="report-item__author">Dilaporkan oleh: ${report.userOwner.name}</div>
        </div>
        <a class="btn report-item__body__read-more" href="#/reports/${report.id}">Selengkapnya <i data-feather="arrow-right"></i></a>
      </div>
    </div>
  `;
}

export function generateReportCommentItemTemplate(comment) {
  return `
    <article tabindex="0" class="report-detail__comment-item">
      <img class="report-detail__comment-item__photo" src="${comment.userOwner.photoUrl}" alt="${comment.userOwner.name}">
      <div class="report-detail__comment-item__body">
        <div class="report-detail__comment-item__body__more-info">
          <div class="report-detail__comment-item__author">${comment.userOwner.name}</div>
        </div>
        <div class="report-detail__comment-item__text">${comment.body}</div>
      </div>
    </article>
  `;
}
