export default class Camera {
  _width = 320;
  _height = 0;

  _cameraContainer = null;
  _selectCameraElement = null;
  _videoElement = null;
  _canvasElement = null;

  _cheeseButtonElement = null;
  _cheeseButtonHandler = null;

  _currentStream = null;
  _streaming = false;

  static isMediaDevicesAvailable() {
    return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
  }

  constructor({ cameraContainer, cameraList, video, canvas, options = {} }) {
    this._cameraContainer = cameraContainer;
    this._selectCameraElement = cameraList;
    this._videoElement = video;
    this._canvasElement = canvas;

    if ('width' in options) {
      this._width = options.width;
    }
    if ('height' in options) {
      this._height = options.height;
    }

    this._populateCameraList();
    this._initialListener();
  }

  async _populateCameraList() {
    try {
      if (!this._selectCameraElement) {
        return;
      }

      const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();
      const cameraList = enumeratedDevices.filter((device) => {
        return device.kind === 'videoinput';
      });

      cameraList.forEach((device) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Camera ${this._selectCameraElement.length + 1}`;
        this._selectCameraElement.appendChild(option);
      });
    } catch (error) {
      console.error(`An error occurred: ${error}`);
    }
  }

  _initialListener() {
    this._videoElement.addEventListener('canplay', () => {
      if (this._streaming) return;

      this._height = this._videoElement.videoHeight / (this._videoElement.videoWidth / this._width);

      // Firefox currently has a bug where the height can't be read from
      // the video, so we will make assumptions if this happens.
      if (isNaN(this._height)) {
        this._height = this._width / (4 / 3);
      }

      // Set photo width and height
      this._videoElement.setAttribute('width', '100%');
      this._videoElement.setAttribute('height', '100%');
      this._canvasElement.setAttribute('width', this._width);
      this._canvasElement.setAttribute('height', this._height);

      this._streaming = true;
    });

    // Event untuk mengganti akses kamera
    this._selectCameraElement.addEventListener('change', async (event) => {
      const selectedDeviceId = event.currentTarget.value;
      this._currentStream = await this._getStream(selectedDeviceId);
      this._videoElement.srcObject = this._currentStream;
      this._videoElement.play();

      this._currentStream.getTracks().forEach((item) => {
        console.log(item);
        // console.log(item.getCapabilities());
      });
    });
  }

  async launch() {
    const deviceId = this._selectCameraElement.value;

    this._currentStream = await this._getStream(deviceId);

    this._videoElement.srcObject = this._currentStream;
    this._videoElement.play();

    // this.clearPhoto();
  }

  stop() {
    if (this._videoElement) {
      this._videoElement.pause();
      this._videoElement.removeAttribute('src');
      this._videoElement.load();
    }

    if (this._currentStream) {
      this._currentStream
        .getTracks()
        .forEach((track) => track.stop());
    }

    this._cheeseButtonElement.removeEventListener('click', this._cheeseButtonHandler)
  }

  async _getStream(deviceId) {
    try {
      if (this._currentStream) {
        this._currentStream
          .getTracks()
          .forEach((track) => track.stop());
      }

      return await navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId },
      });
    } catch (error) {
      console.error(`An error occurred: ${error}`);
      return null;
    }
  }

  clearPhoto() {
    const context = this._canvasElement.getContext('2d');
    context.fillStyle = '#AAA';
    context.fillRect(0, 0, this._canvasElement.width, this._canvasElement.height);

    const blankImage = this._canvasElement.toDataURL('image/png');
  }

  takePicture() {
    const context = this._canvasElement.getContext('2d');

    if (this._width && this._height) {
      this._canvasElement.width = this._width;
      this._canvasElement.height = this._height;
      context.drawImage(this._videoElement, 0, 0, this._width, this._height);

      const data = this._canvasElement.toDataURL('image/png');

      this._streaming = false;
      return data;
    }

    return null;
  }

  addCheeseButtonListener(selector, callback) {
    this._cheeseButtonElement = document.querySelector(selector);
    this._cheeseButtonHandler = callback;

    this._cheeseButtonElement.addEventListener('click', this._cheeseButtonHandler)
  }
}
