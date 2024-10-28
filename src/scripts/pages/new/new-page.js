import { NewPresenter } from './new-presenter';
import Leaflet from '../../utils/leaflet';
import Camera from '../../utils/camera';
import CONFIG from '../../config';
import { getBase64 } from '../../utils';

export default class NewPage {
  _presenter = null;
  _form = null;
  _map = null;

  _isCameraOpen = false;
  _takenPictures = [];

  render() {
    return `
      <section>
        <div class="new-report__hero">
          <h2 class="new-report__title">Buat Laporan Baru</h2>
          <p class="new-report__description">
            Silakan lengkapi formulir di bawah untuk membuat laporan baru.<br>
            Pastikan laporan yang dibuat adalah valid.
          </p>
        </div>
      </section>
  
      <section>
        <div class="new-form__container container">
          <form id="new-form" class="new-form">
            <div class="form-control">
              <label for="new-form-title-input" class="new-form__title-title">Judul Laporan</label>

              <div class="new-form__title-container">
                <input
                  id="new-form-title-input"
                  type="text"
                  name="title"
                  placeholder="Masukkan judul laporan"
                  aria-describedby="title-input-more-info"
                >
              </div>
              <div id="title-input-more-info">Pastikan judul laporan dibuat dengan jelas dan deskriptif dalam 1 kalimat.</div>
            </div>
            <div class="form-control">
              <div class="new-form__damage-level-title">Tingkat Kerusakan</div>

              <div class="new-form__damage-level-container">
                <div class="new-form-damage-level-minor-container">
                  <input id="new-form-damage-level-minor-input" type="radio" name="damageLevel" value="minor">
                  <label for="new-form-damage-level-minor-input">
                    Rendah <span title="Contoh: Lubang kecil di jalan, kerusakan ringan pada tanda lalu lintas, dll."><i class="far fa-question-circle"></i></span>
                  </label>
                </div>
                <div class="new-form-damage-level-moderate-container">
                  <input id="new-form-damage-level-moderate-input" type="radio" name="damageLevel" value="moderate">
                  <label for="new-form-damage-level-moderate-input">
                    Sedang <span title="Contoh: Jalan retak besar, trotoar amblas, lampu jalan mati, dll."><i class="far fa-question-circle"></i></span>
                  </label>
                </div>
                <div class="new-form-damage-level-severe-container">
                  <input id="new-form-damage-level-severe-input" type="radio" name="damageLevel" value="severe">
                  <label for="new-form-damage-level-severe-input">
                    Berat <span title="Contoh: Jembatan ambruk, tiang listrik roboh, longsor yang menutup jalan, dll."><i class="far fa-question-circle"></i></span>
                  </label>
                </div>
              </div>
            </div>
            <div class="form-control">
              <label for="new-form-description-input" class="new-form__description-title">Keterangan</label>

              <div class="new-form__description-container">
                <textarea 
                  id="new-form-description-input"
                  name="description"
                  placeholder="Masukkan keterangan lengkap laporan. Anda dapat menjelaskan apa kejadiannya, dimana, kapan, dll."
                ></textarea>
              </div>
            </div>
            <div class="form-control">
              <div class="new-form__documentations-title">Dokumentasi</div>
              <div id="documentations-more-info">Anda dapat menyertakan foto atau video sebagai dokumentasi.</div>

              <div class="new-form__documentations-container">
                <div class="new-form__documentations__buttons">
                  <label tabindex="0" class="btn btn-outline" for="new-form-documentations-input">Ambil Gambar</label>
                  <input
                    id="new-form-documentations-input"
                    class="new-form__documentations__input"
                    name="documentations"
                    type="file"
                    accept="image/*"
                    multiple
                    aria-multiline="true"
                    aria-describedby="documentations-more-info"
                  >
                  <button type="button" id="new-form-documentations-camera" class="btn btn-outline">Buka Kamera</button>
                </div>
                <div id="new-form-camera-container" class="new-form__camera-container">
                  <video id="new-form-camera-video" class="new-form__camera__video">Video stream not available.</video>
                  <canvas id="new-form-camera-canvas" class="new-form__camera__canvas"></canvas>
                  <div class="new-form__camera__tools">
                    <select id="new-form-camera-list"></select>
                    <button type="button" id="new-form-camera-take" class="btn">Ambil Gambar</button>
                  </div>
                </div>
                <ul id="new-form-documentations-outputs" class="new-form__documentations__outputs"></ul>
              </div>
            </div>
            <div class="form-control">
              <div class="new-form__location-title">Lokasi</div>

              <div class="new-form__location-container">
                <div id="new-form-map-location" class="new-form__location"></div>
                <div class="new-form__location__lat-lng">
                  <input type="text" name="latitude" disabled>
                  <input type="text" name="longitude" disabled>
                </div>
              </div>
            </div>
            <div class="form-buttons">
              <button class="btn" type="submit">Buat Laporan</button>
              <a class="btn btn-outline" href="#/">Batal</a>
            </div>
            <div id="new-report-loader" class="loader"></div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.hideLoading('#new-report-loader');

    this._form = document.getElementById('new-form');
    this._presenter = new NewPresenter(this);

    await this._setupMap();
    await this._setupNewForm();
  }

  async _setupNewForm() {
    const title = this._form.elements.namedItem('title');
    const damageLevel = this._form.elements.namedItem('damageLevel');
    const description = this._form.elements.namedItem('description');
    const latitude = this._form.elements.namedItem('latitude');
    const longitude = this._form.elements.namedItem('longitude');

    this._form.addEventListener('submit', async (event) => {
      event.preventDefault();

      await this._presenter.postNewReport({
        title: title.value,
        damageLevel: damageLevel.value,
        description: description.value,
        evidenceImages: this._takenPictures.map((picture) => picture.imageUrl),
        latitude: latitude.value,
        longitude: longitude.value,
      });
    });

    const documentations = this._form.elements.namedItem('documentations');
    documentations.addEventListener('change', async (event) => {
      const insertingPicturesPromises = Object
        .values(event.srcElement.files)
        .map(async (file) => await this._addTakenPicture(file));
      await Promise.all(insertingPicturesPromises);

      await this._populateTakenPictures();
    });

    const cameraContainer = document.getElementById('new-form-camera-container');
    document
      .getElementById('new-form-documentations-camera')
      .addEventListener('click', async (event) => {
        if (!Camera.isMediaDevicesAvailable()) {
          return;
        }

        cameraContainer.classList.toggle('open');
        this._isCameraOpen = !this._isCameraOpen;

        if (!this._isCameraOpen) {
          this._camera.stop();
          event.currentTarget.textContent = 'Buka Kamera';

          return;
        }

        this._setupCamera();
        event.currentTarget.textContent = 'Tutup Kamera';
      });
  }

  async _setupMap() {
    this._map = await Leaflet.build('#new-form-map-location', {
      zoom: 15,
    });

    // Add more tile
    this._map.addNewRasterTile('MapTiler', 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=L1V7oYaAoswTHnKhMMJ8', {
      attributions: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    });
    this._map.addMaptilerTile('MapTiler Vector');
    this._map.addMapTilerGeocoding();

    // Preparing marker for select coordinate
    const centerCoordinate = this._map.getCenter();

    this._updateLatLngInput(...centerCoordinate);

    const draggableMarker = this._map.addMarker(centerCoordinate, {
      draggable: 'true',
    });

    this._map.addMarkerEventListener(draggableMarker, 'dragend', (event) => {
      const coordinate = event.target.getLatLng();
      this._updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    this._map.addMapEventListener('click', (event) => {
      draggableMarker.setLatLng(event.latlng);
      this._updateLatLngInput(event.latlng.lat, event.latlng.lng);

      // Keep center
      event.sourceTarget.flyTo(event.latlng);
    });
  }

  _setupCamera() {
    const cameraContainer = document.getElementById('new-form-camera-container');
    const video = document.getElementById('new-form-camera-video');
    const cameraList = document.getElementById('new-form-camera-list');
    const canvas = document.getElementById('new-form-camera-canvas');

    this._camera = new Camera({
      cameraContainer,
      cameraList,
      video,
      canvas,
    });

    this._camera.launch();

    this._camera.addCheeseButtonListener('#new-form-camera-take', async () => {
      const imageUrl = this._camera.takePicture();
      await this._addTakenPicture(imageUrl);
      await this._populateTakenPictures();
    });
  }

  async _addTakenPicture(imageUrl) {
    let base64 = imageUrl;

    if (imageUrl instanceof File) {
      base64 = await getBase64(imageUrl);
    }

    this._takenPictures = [...this._takenPictures, {
      id: new Date().getTime(),
      imageUrl: base64,
    }];
  }

  async _populateTakenPictures() {
    const outputs = document.getElementById('new-form-documentations-outputs');

    const listOfPictures = this._takenPictures.map((picture) => {
      return `
        <li class="new-form__documentations__outputs-item">
          <button type="button" data-deletepictureid="${picture.id}" class="new-form__documentations__outputs-item__delete-btn">
            <img src="${picture.imageUrl}" alt="">
          </button>
        </li>
      `;
    });

    outputs.innerHTML = listOfPictures.join('');

    document
      .querySelectorAll('button[data-deletepictureid]')
      .forEach((button) => button.addEventListener('click', (event) => {
        const pictureId = event.currentTarget.dataset.deletepictureid;
        const deleted = this._removePicture(pictureId);
        if (!deleted) {
          console.log(`Picture with id ${pictureId} was not found`);
        }

        // Updating taken pictures
        this._populateTakenPictures();
      }));
  }

  _removePicture(id) {
    const selectedPicture = this._takenPictures.find((picture) => {
      return picture.id == id;
    });

    // Check if founded selectedPicture is available
    if (!selectedPicture) {
      return null;
    }

    // Deleting selected selectedPicture from takenPictures
    this._takenPictures = this._takenPictures.filter((picture) => {
      return picture.id !== selectedPicture.id;
    });

    return selectedPicture;
  }

  _updateLatLngInput(latitude, longitude) {
    this._form.elements.namedItem('latitude').value = latitude;
    this._form.elements.namedItem('longitude').value = longitude;
  }

  storeSuccessfully() {
    console.log('Success storing new report');
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
