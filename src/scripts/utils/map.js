import {Icon, icon, map, Marker, marker, popup, tileLayer} from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { getPosition } from './index';

export default class Map {
  _element = null;
  _map = null;

  constructor(selector, center, options = {}) {
    this._element = document.querySelector(selector);

    this._map = map(this._element, {
      center: center,
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
  static async build(selector, center, options = {}) {
    if (!center) {
      const position = await getPosition();
      const coordinate = [position.coords.latitude, position.coords.longitude];

      return new Map(selector, coordinate, options);
    }

    return new Map(selector, center, options);
  }

  addBaseLayer() {
    const baseLayer = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    baseLayer.addTo(this._map);
  }

  changeCamera(coordinate, zoomLevel) {
    this._map.setView(coordinate, zoomLevel);
  }

  createIcon(options) {
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
