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
    return 'mediaDevices' in navigator;
  }

  constructor({ cameraContainer, cameraList, video, canvas, options = {} }) {
    this._cameraContainer = cameraContainer;
    this._selectCameraElement = cameraList;
    this._videoElement = video;
    this._canvasElement = canvas;

    if (Object.hasOwn(options, 'width')) {
      this._width = options.width;
    }
    if (Object.hasOwn(options, 'height')) {
      this._height = options.height;
    }

    this._populateCameraList();
    this._initialListener();
  }

  async _populateCameraList() {
    // make sure _selectCameraElement is empty before populating it with camera options
    this._selectCameraElement.innerHTML = '';

    try {
      const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();
      const cameraList = enumeratedDevices.filter((device) => {
        return device.kind === 'videoinput';
      });

      cameraList.forEach((device) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Camera ${this._selectCameraElement.length + 1}`;
        /**
         * review:
         * sebelum append camera option lainnya, `_selectCameraElement` perlu di clear dulu
         * karena sekarang ada bugs di mana kamera ditutup terus dibuka kembali opsinya jadi banyak (double-double)
         */
        this._selectCameraElement.appendChild(option);
      });
    } catch (error) {
      console.error('_populateCameraList: error:', error);
    }
  }

  _initialListener() {
    this._videoElement.addEventListener('canplay', () => {
      if (this._streaming) {
        return;
      }

      this._height = this._videoElement.videoHeight / (this._videoElement.videoWidth / this._width);

      // Set photo width and height
      this._canvasElement.setAttribute('width', this._width);
      this._canvasElement.setAttribute('height', this._height);

      this._streaming = true;
    });

    // Event untuk mengganti akses kamera
    this._selectCameraElement.addEventListener('change', async () => {
      await this.stop();
      await this.launch();
    });
  }

  async launch() {
    this._currentStream = await this._getStream();
    this._videoElement.srcObject = this._currentStream;
    this._videoElement.play();

    Camera.addNewStream(this._currentStream);

    this._clearCanvas();
  }

  static addNewStream(stream) {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [];

      return;
    }

    window.currentStreams = [...window.currentStreams, stream];
  }

  static stopAllStreams() {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [];

      return;
    }

    const activeStreams = window.currentStreams.filter((stream) => stream.active);
    activeStreams.forEach((stream) => {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    });
  }

  stop() {
    if (this._videoElement) {
      this._videoElement.pause();
      this._videoElement.removeAttribute('src');
      this._videoElement.load();
    }

    if (this._currentStream instanceof MediaStream) {
      this._currentStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    this._cheeseButtonElement.removeEventListener('click', this._cheeseButtonHandler);
  }

  async _getStream() {
    const deviceId = this._selectCameraElement.value;

    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId,
          facingMode: { exact: 'environment' },
        },
      });
    } catch (error) {
      if (error.name === 'OverconstrainedError') {
        // Fallback: Gunakan kamera depan jika kamera belakang tidak tersedia
        try {
          return await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: deviceId,
            },
          });
        } catch (fallbackError) {
          console.error('_getStream: fallbackError:', fallbackError);
          return null;
        }
      } else {
        console.error('_getStream: error:', error);
        return null;
      }
    }
  }

  _clearCanvas() {
    const context = this._canvasElement.getContext('2d');
    context.fillStyle = '#AAA';
    context.fillRect(0, 0, this._canvasElement.width, this._canvasElement.height);
  }

  async takePicture() {
    if (!(this._width && this._height)) {
      return null;
    }

    const context = this._canvasElement.getContext('2d');

    this._canvasElement.width = this._width;
    this._canvasElement.height = this._height;
    context.drawImage(this._videoElement, 0, 0, this._width, this._height);

    return await new Promise((resolve) => {
      this._canvasElement.toBlob((blob) => {
        if (blob !== null) {
          resolve(blob);
        }

        resolve(this._canvasElement.toDataURL('image/png'));
      });
    });
  }

  addCheeseButtonListener(selector, callback) {
    this._cheeseButtonElement = document.querySelector(selector);
    this._cheeseButtonHandler = callback;

    this._cheeseButtonElement.addEventListener('click', this._cheeseButtonHandler);
  }
}
