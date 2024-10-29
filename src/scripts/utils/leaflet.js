import { Icon, icon, map, marker, popup, tileLayer, control } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { getCurrentPosition } from './index';
import { MaptilerLayer, MaptilerStyle } from '@maptiler/leaflet-maptilersdk';
import { GeocodingControl } from '@maptiler/geocoding-control/leaflet';
import CONFIG from '../config';

export default class Leaflet {
  _element = null;
  _map = null;

  _layerControls = null;

  constructor(selector, options = {}) {
    this._element = document.querySelector(selector);

    const baseLayer = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    this._map = map(this._element, {
      zoom: 5,
      scrollWheelZoom: false,
      layers: [baseLayer],
      ...options,
    });

    const baseLayers = { 'OpenStreetMap': baseLayer };
    const overlays = {};
    this._layerControls = control.layers(baseLayers, overlays, {
      position: 'topleft',
    });
    this._layerControls.addTo(this._map);
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

      const coordinate = [-6.200000, 106.816666];

      return new Leaflet(selector, {
        ...options,
        center: coordinate,
      });
    }
  }

  static async getPlaceNameByCoordinate(latitude, longitude) {
    const url = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${CONFIG.MAP_SERVICE_API_KEY}`;

    try {
      const response = await fetch(url);
      const json = await response.json();
      const place = json.features[0].place_name_id.split(', ');
      return [place.at(-2), place.at(-1)].map((name) => name).join(', ');
    } catch {
      console.error('Gagal mendapatkan nama lokasi');
      return `${latitude},${longitude}`;
    }
  }

  changeCamera(coordinate, zoomLevel = undefined) {
    this._map.setView(coordinate, zoomLevel);
  }

  getCenter() {
    const { lat, lng } = this._map.getCenter();
    return [lat, lng];
  }

  addMapTilerGeocoding(options = {}) {
    const geocoderControl = new GeocodingControl({
      apiKey: CONFIG.MAP_SERVICE_API_KEY,
      zoom: 15,
      flyTo: true,
      keepOpen: false,
      placeholder: 'Cari lokasi...',
      errorMessage: 'Lokasi tidak ditemukan',
      ...options,
    });

    geocoderControl.addTo(this._map);
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

  addNewRasterTile(name, url, options = {}) {
    const tile = tileLayer(url, options);
    this._layerControls.addBaseLayer(tile, name);
  }

  addMaptilerTile(name, options = {}) {
    const maptiler = new MaptilerLayer({
      apiKey: CONFIG.MAP_SERVICE_API_KEY,
      style: MaptilerStyle.STREETS,
      ...options,
    });
    this._layerControls.addBaseLayer(maptiler, name);
  }
}
