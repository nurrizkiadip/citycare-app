import { Icon, icon, map, marker, popup, tileLayer, control } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { getCurrentPosition } from './index';
import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk';
import { GeocodingControl } from '@maptiler/geocoding-control/leaflet';
import { MAP_SERVICE_API_KEY } from '../config';

export default class Leaflet {
  #container = null;
  #map = null;

  #layerControls = null;

  constructor(selector, options = {}) {
    this.#container = document.querySelector(selector);

    const baseLayer = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    this.#map = map(this.#container, {
      zoom: 5,
      scrollWheelZoom: false,
      layers: [baseLayer],
      ...options,
    });

    const baseLayers = { OpenStreetMap: baseLayer };
    const overlays = {};
    this.#layerControls = control.layers(baseLayers, overlays, {
      position: 'topleft',
    });
    this.#layerControls.addTo(this.#map);
  }

  /**
   * Reference of using static method build:
   * https://stackoverflow.com/questions/43431550/how-can-i-invoke-asynchronous-code-within-a-constructor
   * */
  static async build(selector, options = {}) {
    if (Object.hasOwn(options, 'center')) {
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
      console.error('build: error:', error);

      const coordinate = [-6.2, 106.816666];

      return new Leaflet(selector, {
        ...options,
        center: coordinate,
      });
    }
  }

  static async getPlaceNameByCoordinate(latitude, longitude) {
    try {
      const url = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${MAP_SERVICE_API_KEY}&language=id&limit=1`;
      const response = await fetch(url);
      const json = await response.json();

      const place = json.features[0].place_name.split(', ');
      return [place.at(-2), place.at(-1)].map((name) => name).join(', ');
    } catch (error) {
      console.error('getPlaceNameByCoordinate: error:', error);
      return `${latitude}, ${longitude}`;
    }
  }

  changeCamera(coordinate, zoomLevel = undefined) {
    this.#map.setView(coordinate, zoomLevel);
  }

  getCenter() {
    const { lat, lng } = this.#map.getCenter();
    return [lat, lng];
  }

  addMapTilerGeocoding(options = {}) {
    if (typeof options !== 'object') {
      throw new Error('options must be an object');
    }

    const geocoderControl = new GeocodingControl({
      apiKey: MAP_SERVICE_API_KEY,
      zoom: 15,
      flyTo: true,
      keepOpen: false,
      placeholder: 'Cari lokasi...',
      errorMessage: 'Lokasi tidak ditemukan',
      ...options,
    });

    geocoderControl.addTo(this.#map);
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

    newMarker.addTo(this.#map);
    return newMarker;
  }

  addMarkerEventListener(marker, eventName, callback) {
    marker.on(eventName, callback);
  }

  addMapEventListener(eventName, callback) {
    this.#map.on(eventName, callback);
  }

  addNewRasterTile(name, url, options = {}) {
    const rasterUrl = new URL(url);
    rasterUrl.searchParams.set('key', MAP_SERVICE_API_KEY);

    const tile = tileLayer(rasterUrl.href, options);
    this.#layerControls.addBaseLayer(tile, name);
  }

  addMaptilerTile(name, style, options = {}) {
    const maptiler = new MaptilerLayer({
      apiKey: MAP_SERVICE_API_KEY,
      ...options,
    });
    this.#layerControls.addBaseLayer(maptiler, name);
  }
}
