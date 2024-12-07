export default class Camera {
  #width = 320;
  #height = 0;

  #cameraContainer = null;
  #selectCameraElement = null;
  #videoElement = null;
  #canvasElement = null;

  #cheeseButtonElement = null;
  #cheeseButtonHandler = null;

  #currentStream = null;
  #streaming = false;

  static isMediaDevicesAvailable() {
    return 'mediaDevices' in navigator;
  }

  constructor({ cameraContainer, cameraList: cameraSelect, video, canvas, options = {} }) {
    this.#cameraContainer = cameraContainer;
    this.#selectCameraElement = cameraSelect;
    this.#videoElement = video;
    this.#canvasElement = canvas;

    if (Object.hasOwn(options, 'width')) {
      this.#width = options.width;
    }
    if (Object.hasOwn(options, 'height')) {
      this.#height = options.height;
    }

    this.#initialListener();
  }

  async #populateCameraList() {
    try {
      const enumeratedDevices = await navigator.mediaDevices.enumerateDevices();
      const cameraList = enumeratedDevices.filter((device) => {
        return device.kind === 'videoinput';
      });

      this.#selectCameraElement.innerHTML = cameraList.reduce(
        (accumulator, device, currentIndex) => {
          return accumulator.concat(`
            <option value="${device.deviceId}">
              ${device.label || `Camera ${currentIndex + 1}`}
            </option>
          `);
        },
        '',
      );
    } catch (error) {
      console.error('#populateCameraList: error:', error);
    }
  }

  #initialListener() {
    this.#videoElement.addEventListener('canplay', () => {
      if (this.#streaming) {
        return;
      }

      this.#height = this.#videoElement.videoHeight / (this.#videoElement.videoWidth / this.#width);

      // Set photo width and height
      this.#canvasElement.setAttribute('width', this.#width);
      this.#canvasElement.setAttribute('height', this.#height);

      this.#streaming = true;
    });

    // Event untuk mengganti akses kamera
    this.#selectCameraElement.addEventListener('change', async () => {
      await this.stop();
      await this.launch();
    });
  }

  async launch() {
    const selectedDevice = this.#selectCameraElement.value;
    this.#currentStream = await this.#getCameraStream(selectedDevice);
    this.#videoElement.srcObject = this.#currentStream;
    this.#videoElement.play();

    Camera.addNewStream(this.#currentStream);

    this.#clearCanvas();
  }

  static addNewStream(stream) {
    if (!Array.isArray(window.currentStreams)) {
      window.currentStreams = [stream];
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
    if (this.#videoElement) {
      this.#videoElement.pause();
      this.#videoElement.removeAttribute('src');
      this.#videoElement.load();

      this.#streaming = false;
    }

    if (this.#currentStream instanceof MediaStream) {
      this.#currentStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    this.#cheeseButtonElement.removeEventListener('click', this.#cheeseButtonHandler);
  }

  async #getCameraStream(deviceId = null) {
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
          console.error('#getCameraStream: fallbackError:', fallbackError);
          return null;
        }
      } else {
        console.error('#getCameraStream: error:', error);
        return null;
      }
    } finally {
      this.#populateCameraList();
    }
  }

  #clearCanvas() {
    const context = this.#canvasElement.getContext('2d');
    context.fillStyle = '#AAA';
    context.fillRect(0, 0, this.#canvasElement.width, this.#canvasElement.height);
  }

  async takePicture() {
    if (!(this.#width && this.#height)) {
      return null;
    }

    const context = this.#canvasElement.getContext('2d');

    this.#canvasElement.width = this.#width;
    this.#canvasElement.height = this.#height;
    context.drawImage(this.#videoElement, 0, 0, this.#width, this.#height);

    return await new Promise((resolve) => {
      this.#canvasElement.toBlob((blob) => {
        if (blob !== null) {
          resolve(blob);
        }

        resolve(this.#canvasElement.toDataURL('image/png'));
      });
    });
  }

  addCheeseButtonListener(selector, callback) {
    this.#cheeseButtonElement = document.querySelector(selector);
    this.#cheeseButtonHandler = callback;

    this.#cheeseButtonElement.addEventListener('click', this.#cheeseButtonHandler);
  }
}
