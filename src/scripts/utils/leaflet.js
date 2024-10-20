import { Icon, icon, map, marker, popup, tileLayer } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { getCurrentPosition } from './index';

export default class Leaflet {
  _element = null;
  _map = null;

  constructor(selector, options = {}) {
    this._element = document.querySelector(selector);

    this._map = map(this._element, {
      zoom: 5,
      scrollWheelZoom: false,
      ...options,
    });

    this.addBaseLayer();
  }

  /**
   * Reference of using static method build:
   * https://stackoverflow.com/questions/43431550/how-can-i-invoke-asynchronous-code-within-a-constructor
   * */
  static async build(selector, options = {}) {
    if ('center' in options) {
      return new Leaflet(selector, options);
    }

    try {
      const position = await getCurrentPosition();
      const coordinate = [position.coords.latitude, position.coords.longitude];

      return new Leaflet(selector, {
        ...options,
        center: coordinate,
      });
    } catch (error) {
      window.alert(error.message);
      console.error(error.message);

      return new Leaflet(selector, {
        ...options,
        center: [-6.200000, 106.816666],
      });
    }
  }

  addBaseLayer() {
    const baseLayer = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    baseLayer.addTo(this._map);
  }

  changeCamera(coordinate, zoomLevel = undefined) {
    this._map.setView(coordinate, zoomLevel);
  }

  getCenter() {
    return this._map.getCenter();
  }

  createIcon(options = {}) {
    return icon({
      ...Icon.Default.prototype.options,
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      ...options,
    });
  }

  addMarker(coordinates, markerOptions = {}, popupOptions = null) {
    if (typeof markerOptions !== 'object') {
      throw new Error('markerOptions must be an object');
    }

    const newMarker = marker(coordinates, {
      icon: this.createIcon(),
      alt: 'Marker',
      ...markerOptions,
    });

    if (popupOptions) {
      if (typeof popupOptions !== 'object') {
        throw new Error('popupOptions must be an object');
      }

      const newPopup = popup(popupOptions);
      newPopup.setLatLng(coordinates);
      newPopup.setContent((layer) => {
        return layer.options.alt;
      });
      newMarker.bindPopup(newPopup);
    }

    newMarker.addTo(this._map);
    return newMarker;
  }

  addMarkerEventListener(marker, eventName, callback) {
    marker.on(eventName, callback);
  }

  addMapEventListener(eventName, callback) {
    this._map.on(eventName, callback);
  }
}
