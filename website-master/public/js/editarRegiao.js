function $(selector) { return document.querySelector(selector); }

/* Basic example */

const parentBasic = $('#vanillaColor'),
      popupBasic = new Picker({
          parent: parentBasic,
          onDone: function(color) {
            map.removeLayer(layer);
            layer.options.color = color.rgbaString();
            map.addLayer(layer);
        },
      });
popupBasic.onChange = function(color) {
  map.removeLayer(layer);
  layer.options.color = color.rgbaString();
  map.addLayer(layer);
};

function isMarkerOnPolygons (ev) {
    var layerx = []
    map.eachLayer(function(layer){
        if(layer instanceof L.Polygon && !(layer instanceof L.Rectangle) ){
            layerx.push(layer);
        }
    });
    var i;
    for(i = 0; i<layerx.length;i++){
        var contained = layerx[i].contains(ev.latlng);
        if (contained) return layerx[i];
    }
    return undefined;
}

function isMarkerOnLayer (ev,layer) {
  var contained = layer.contains(ev.latlng);
  if (contained) return true;
  return false;
} 
/*
function getIndex(layer,marker){
    var polypoints = layer.getLatLngs();
    var markerpoints = marker.getLatLng();
    console.log(polypoints[0][0].lat);
    console.log(markerpoints.lat);
    var i;
    var min;
    for(i=0;i<polypoints[0].length;i++){
        var dist = Math.sqrt(Math.pow((polypoints[0][i].lat-markerpoints.lat),2)+Math.pow((polypoints[0][i].lng-markerpoints.lng),2))
        console.log(dist);
    }
}

/ Force zIndex of Leaflet
(function(global){
  var MarkerMixin = {
    _updateZIndex: function (offset) {
      this._icon.style.zIndex = this.options.forceZIndex ? (this.options.forceZIndex + (this.options.zIndexOffset || 0)) : (this._zIndex + offset);
    },
    setForceZIndex: function(forceZIndex) {
      this.options.forceZIndex = forceZIndex ? forceZIndex : null;
    }
  };
  if (global) global.include(MarkerMixin);
})(L.Marker);*/