import NewPresenter from './new-presenter';
import Leaflet from '../../utils/leaflet';
import Camera from '../../utils/camera';
import { convertBase64ToBlob } from '../../utils';
import { MaptilerStyle } from '@maptiler/leaflet-maptilersdk';
import * as CityCareAPI from '../../data/api';
import { generateLoaderAbsoluteTemplate } from '../../templates';

export default class NewPage {
  #presenter = null;
  #form = null;
  #map = null;
  #isCameraOpen = false;
  #takenDocumentations = [];
  #camera = null;

  async render() {
    return `
      <section>
        <div class="new-report__header">
          <div class="container">
            <h1 class="new-report__header__title">Buat Laporan Baru</h1>
            <p class="new-report__header__description">
              Silakan lengkapi formulir di bawah untuk membuat laporan baru.<br>
              Pastikan laporan yang dibuat adalah valid.
            </p>
          </div>
        </div>
      </section>
  
      <section class="container">
        <div class="new-form__container">
          <form id="new-form" class="new-form">
            <div class="form-control">
              <label for="title-input" class="new-form__title__title">Judul Laporan</label>

              <div class="new-form__title__container">
                <input
                  id="title-input"
                  type="text"
                  name="title"
                  placeholder="Masukkan judul laporan"
                  aria-describedby="title-input-more-info"
                >
              </div>
              <div id="title-input-more-info">Pastikan judul laporan dibuat dengan jelas dan deskriptif dalam 1 kalimat.</div>
            </div>
            <div class="form-control">
              <div class="new-form__damage-level__title">Tingkat Kerusakan</div>

              <div class="new-form__damage-level__container">
                <div class="new-form__damage-level__minor__container">
                  <input id="damage-level-minor-input" type="radio" name="damageLevel" value="minor">
                  <label for="damage-level-minor-input">
                    Rendah <span title="Contoh: Lubang kecil di jalan, kerusakan ringan pada tanda lalu lintas, dll."><i class="far fa-question-circle"></i></span>
                  </label>
                </div>
                <div class="new-form__damage-level__moderate__container">
                  <input id="damage-level-moderate-input" type="radio" name="damageLevel" value="moderate">
                  <label for="damage-level-moderate-input">
                    Sedang <span title="Contoh: Jalan retak besar, trotoar amblas, lampu jalan mati, dll."><i class="far fa-question-circle"></i></span>
                  </label>
                </div>
                <div class="new-form__damage-level__severe__container">
                  <input id="damage-level-severe-input" type="radio" name="damageLevel" value="severe">
                  <label for="damage-level-severe-input">
                    Berat <span title="Contoh: Jembatan ambruk, tiang listrik roboh, longsor yang menutup jalan, dll."><i class="far fa-question-circle"></i></span>
                  </label>
                </div>
              </div>
            </div>
            <div class="form-control">
              <label for="description-input" class="new-form__description__title">Keterangan</label>

              <div class="new-form__description__container">
                <textarea 
                  id="description-input"
                  name="description"
                  placeholder="Masukkan keterangan lengkap laporan. Anda dapat menjelaskan apa kejadiannya, dimana, kapan, dll."
                ></textarea>
              </div>
            </div>
            <div class="form-control">
              <div class="new-form__documentations__title">Dokumentasi</div>
              <div id="documentations-more-info">Anda dapat menyertakan foto atau video sebagai dokumentasi.</div>

              <div class="new-form__documentations__container">
                <div class="new-form__documentations__buttons">
                  <label for="documentations-input" class="btn btn-outline">Ambil Gambar</label>
                  <input
                    id="documentations-input"
                    class="new-form__documentations__input"
                    name="documentations"
                    type="file"
                    accept="image/*"
                    multiple
                    aria-multiline="true"
                    aria-describedby="documentations-more-info"
                  >
                  <button id="open-documentations-camera-button" class="btn btn-outline" type="button">
                    Buka Kamera
                  </button>
                </div>
                <div id="camera-container" class="new-form__camera__container">
                  <video id="camera-video" class="new-form__camera__video">Video stream not available.</video>
                  <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>

                  <div class="new-form__camera__tools">
                    <select id="camera-select"></select>
                    <button id="camera-take-button" class="btn" type="button">
                      Ambil Gambar
                    </button>
                  </div>
                </div>
                <ul id="documentations-taken-list" class="new-form__documentations__outputs"></ul>
              </div>
            </div>
            <div class="form-control">
              <div class="new-form__location__title">Lokasi</div>

              <div class="new-form__location__container">
                <div class="new-form__location__map__container">
                  <div id="map" class="new-form__location__map"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="new-form__location__lat-lng">
                  <input type="text" name="latitude" disabled>
                  <input type="text" name="longitude" disabled>
                </div>
              </div>
            </div>
            <div class="form-buttons">
              <span id="submit-button-container">
                <button class="btn" type="submit">Buat Laporan</button>
              </span>
              <a class="btn btn-outline" href="#/">Batal</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: CityCareAPI,
    });
    this.#isCameraOpen = false;
    this.#takenDocumentations = [];

    this.#presenter.showNewFormMap();
    this.#setupForm();
  }

  #setupForm() {
    this.#form = document.getElementById('new-form');
    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const data = {
        title: this.#form.elements.namedItem('title').value,
        damageLevel: this.#form.elements.namedItem('damageLevel').value,
        description: this.#form.elements.namedItem('description').value,
        evidenceImages: this.#takenDocumentations.map((picture) => picture.blob),
        latitude: this.#form.elements.namedItem('latitude').value,
        longitude: this.#form.elements.namedItem('longitude').value,
      };
      await this.#presenter.postNewReport(data);
    });

    document.getElementById('documentations-input').addEventListener('change', async (event) => {
      const insertingPicturesPromises = Object.values(event.srcElement.files).map(
        this.#addTakenPicture,
      );
      await Promise.all(insertingPicturesPromises);

      await this.#populateTakenPictures();
    });

    const cameraContainer = document.getElementById('camera-container');
    document
      .getElementById('open-documentations-camera-button')
      .addEventListener('click', async (event) => {
        if (!Camera.isMediaDevicesAvailable()) {
          console.log('Media Stream API tidak didukung oleh browser ini.');
          alert('Media Stream API tidak didukung oleh browser ini.');
          return;
        }

        cameraContainer.classList.toggle('open');
        this.#isCameraOpen = cameraContainer.classList.contains('open');

        if (this.#isCameraOpen) {
          this.#setupCamera();
          event.currentTarget.textContent = 'Tutup Kamera';
          return;
        }

        this.#camera.stop();
        event.currentTarget.textContent = 'Buka Kamera';
      });
  }

  async initialMap() {
    this.#map = await Leaflet.build('#map', {
      zoom: 16,
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

    // Preparing marker for select coordinate
    const centerCoordinate = this.#map.getCenter();

    this.#updateLatLngInput(centerCoordinate[0], centerCoordinate[1]);

    const draggableMarker = this.#map.addMarker(centerCoordinate, {
      draggable: 'true',
    });

    this.#map.addMarkerEventListener(draggableMarker, 'dragend', (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    this.#map.addMapEventListener('click', (event) => {
      draggableMarker.setLatLng(event.latlng);
      this.#updateLatLngInput(event.latlng.lat, event.latlng.lng);

      // Keep center
      event.sourceTarget.flyTo(event.latlng);
    });
  }

  #setupCamera() {
    this.#camera = new Camera({
      cameraContainer: document.getElementById('camera-container'),
      cameraList: document.getElementById('camera-select'),
      video: document.getElementById('camera-video'),
      canvas: document.getElementById('camera-canvas'),
    });

    this.#camera.launch();

    this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
      const image = await this.#camera.takePicture();

      await this.#addTakenPicture(image);
      await this.#populateTakenPictures();
    });
  }

  async #addTakenPicture(image) {
    let blob = image;

    if (image instanceof String) {
      blob = await convertBase64ToBlob(image, 'image/png');
    }

    const newDocumentation = {
      id: Number(new Date()),
      blob: blob,
    };
    this.#takenDocumentations = [...this.#takenDocumentations, newDocumentation];
  }

  async #populateTakenPictures() {
    const html = this.#takenDocumentations.reduce((accumulator, picture, currentIndex) => {
      const imageUrl = URL.createObjectURL(picture.blob);
      return accumulator.concat(`
        <li class="new-form__documentations__outputs-item">
          <button type="button" data-deletepictureid="${picture.id}" class="new-form__documentations__outputs-item__delete-btn">
            <img src="${imageUrl}" alt="Dokumentasi ke-${currentIndex + 1}">
          </button>
        </li>
      `);
    }, '');
    document.getElementById('documentations-taken-list').innerHTML = html;

    document.querySelectorAll('button[data-deletepictureid]').forEach((button) =>
      button.addEventListener('click', (event) => {
        const pictureId = event.currentTarget.dataset.deletepictureid;
        const deleted = this.#removePicture(pictureId);
        if (!deleted) {
          console.log(`Picture with id ${pictureId} was not found`);
        }

        // Updating taken pictures
        this.#populateTakenPictures();
      }),
    );
  }

  #removePicture(id) {
    const selectedPicture = this.#takenDocumentations.find((picture) => {
      return picture.id == id;
    });

    // Check if founded selectedPicture is available
    if (!selectedPicture) {
      return null;
    }

    // Deleting selected selectedPicture from takenPictures
    this.#takenDocumentations = this.#takenDocumentations.filter((picture) => {
      return picture.id != selectedPicture.id;
    });

    return selectedPicture;
  }

  #updateLatLngInput(latitude, longitude) {
    this.#form.elements.namedItem('latitude').value = latitude;
    this.#form.elements.namedItem('longitude').value = longitude;
  }

  storeSuccessfully(message) {
    alert(message);
    this.clearForm();
    location.href = '/';
  }

  storeFailed(message) {
    alert(message);
  }

  clearForm() {
    this.#form.reset();
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Buat Laporan
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById('submit-button-container').innerHTML = `
      <button class="btn" type="submit">Buat Laporan</button>
    `;
  }
}
