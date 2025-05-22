import maplibregl, { Hash } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Protocol } from "pmtiles";

const initialCenter = [139.766966, 35.681163];

let protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

var map2 = new maplibregl.Map({
  container: "map2",
  hash: true,
  style: "styles/style.json",
  center: initialCenter,
  zoom: 14,
});

window.map2 = map2;

let maplibreMap = null;

function initializeMaplibreMaps(style, center, zoom) {
  const mapContainer = document.getElementById("map1");
  mapContainer.innerHTML = "";
  maplibreMap = new maplibregl.Map({
    container: "map1",
    hash: true,
    style: style,
    center: center,
    zoom: zoom,
  });

  window.maplibreMap = maplibreMap;

  maplibreMap.on("load", async () => {
    maplibreMap.addControl(new maplibregl.NavigationControl());
    maplibreMap.showTileBoundaries = true;
  });

  maplibreMap.on("move", () => {
    if (!isSyncingmap1) {
      isSyncingmap2 = true;
      syncMaps(maplibreMap, map2);
    }
  });

  maplibreMap.on("moveend", () => {
    isSyncingmap2 = false;
  });

  maplibreMap.on("contextmenu", (e) => {
    const features = maplibreMap.queryRenderedFeatures(e.point);
    resetHightlightLayers();
    if (features.length > 0) {
      console.log("フィーチャ数：" + features.length);
      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        console.log("レイヤーID：" + feature.layer.id);
        console.log("フィーチャID：" + feature.id);
        console.log(JSON.stringify(feature.properties, null, 2));
      }
      const lineFeatures = features.filter((f) => "layer" in f && f.layer.type === "line");
      if (lineFeatures.length > 0) {
        maplibreMap.getSource("highlight-source-line").setData({
          type: "FeatureCollection",
          features: lineFeatures,
        });
      }
      const fillFeatures = features.filter((f) => "layer" in f && f.layer.type === "fill" && f.layer.id !== "land");
      if (fillFeatures.length > 0) {
        maplibreMap.getSource("highlight-source-line").setData({
          type: "FeatureCollection",
          features: fillFeatures,
        });
      }
    }
    function resetHightlightLayers() {
      if (maplibreMap.getSource("highlight-source-line")) {
        maplibreMap.removeLayer("highlight-layer-line");
        maplibreMap.removeSource("highlight-source-line");
      }
      maplibreMap.addSource("highlight-source-line", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
      maplibreMap.addLayer({
        id: "highlight-layer-line",
        type: "line",
        source: "highlight-source-line",
        paint: {
          "line-color": "rgb(255, 0, 0)",
          "line-width": 2,
          "line-opacity": 0.8,
        },
      });
      if (maplibreMap.getSource("highlight-source-fill")) {
        maplibreMap.removeLayer("highlight-layer-fill");
        maplibreMap.removeSource("highlight-source-fill");
      }
      maplibreMap.addSource("highlight-source-fill", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
      maplibreMap.addLayer({
        id: "highlight-layer-fill",
        type: "fill",
        source: "highlight-source-fill",
        paint: {
          "fill-outline-color": "rgb(255, 0, 0)",
        },
      });
    }
  });
}

initializeMaplibreMaps("styles/style_gsi_std.json", initialCenter, 14);

let isSyncingmap2 = false;
let isSyncingmap1 = false;

function syncMaps(sourceMap, targetMap) {
  targetMap.jumpTo({
    center: sourceMap.getCenter(),
    zoom: sourceMap.getZoom(),
    bearing: sourceMap.getBearing(),
    pitch: sourceMap.getPitch(),
  });
}

map2.on("move", function () {
  if (!isSyncingmap2) {
    isSyncingmap1 = true;
    syncMaps(map2, maplibreMap);
  }
});

map2.on("moveend", function () {
  isSyncingmap1 = false;
});

map2.on("load", async () => {
  map2.addControl(new maplibregl.NavigationControl());
  map2.showTileBoundaries = true;
  const image_intersection = await map2.loadImage("icons/intersection.png");
  map2.addImage("intersection_variable", image_intersection.data, {
    content: [1, 1, 31, 9],
    stretchX: [[1, 31]],
    stretchY: [[1, 9]],
  });
  const image_point = await map2.loadImage("icons/point.png");
  map2.addImage("point", image_point.data);
});

map2.on("contextmenu", (e) => {
  const features = map2.queryRenderedFeatures(e.point);
  resetHightlightLayers();
  if (features.length > 0) {
    console.log("フィーチャ数：" + features.length);
    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      console.log("レイヤーID：" + feature.layer.id);
      console.log("フィーチャID：" + feature.id);
      console.log(JSON.stringify(feature.properties, null, 2));
    }
    const lineFeatures = features.filter((f) => "layer" in f && f.layer.type === "line");
    if (lineFeatures.length > 0) {
      map2.getSource("highlight-source-line").setData({
        type: "FeatureCollection",
        features: lineFeatures,
      });
    }
    const fillFeatures = features.filter((f) => "layer" in f && f.layer.type === "fill" && f.layer.id !== "land");
    if (fillFeatures.length > 0) {
      map2.getSource("highlight-source-line").setData({
        type: "FeatureCollection",
        features: fillFeatures,
      });
    }
  }

  function resetHightlightLayers() {
    if (map2.getSource("highlight-source-line")) {
      map2.removeLayer("highlight-layer-line");
      map2.removeSource("highlight-source-line");
    }
    map2.addSource("highlight-source-line", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
    map2.addLayer({
      id: "highlight-layer-line",
      type: "line",
      source: "highlight-source-line",
      paint: {
        "line-color": "rgb(255, 0, 0)",
        "line-width": 2,
        "line-opacity": 0.8,
      },
    });
    if (map2.getSource("highlight-source-fill")) {
      map2.removeLayer("highlight-layer-fill");
      map2.removeSource("highlight-source-fill");
    }
    map2.addSource("highlight-source-fill", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
    map2.addLayer({
      id: "highlight-layer-fill",
      type: "fill",
      source: "highlight-source-fill",
      paint: {
        "fill-outline-color": "rgb(255, 0, 0)",
      },
    });
  }
});

const basemapSelect = document.getElementById("basemap-select");

basemapSelect.addEventListener("change", (event) => {
  const selectedStyle = event.target.value;
  const center = map2.getCenter();
  const zoom = map2.getZoom();

  initializeMaplibreMaps(selectedStyle, [center.lng, center.lat], zoom);
});
