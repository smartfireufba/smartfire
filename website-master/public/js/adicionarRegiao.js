function $(selector) { return document.querySelector(selector); }

/* Basic example */

const parentBasic = $('#vanillaColor'),
      popupBasic = new Picker({
          parent: parentBasic,
          onDone: function(color) {
            map.removeLayer(poligono);
            poligono = L.polygon(poligonoLatLngs, {color: color.rgbaString()});
            map.addLayer(poligono);
            cor = color.rgbaString();
        },
      });
popupBasic.onChange = function(color) {
    map.removeLayer(poligono);
    poligono = L.polygon(poligonoLatLngs, {color: color.rgbaString()});
    map.addLayer(poligono);
    cor = color.rgbaString();
};
//Open the popup manually:
//popupBasic.openHandler();

function isMarkerOnPolygon (ev) {
  var contained = poligono.contains(ev.latlng);
  if (contained) return poligono;
  return "z";
}