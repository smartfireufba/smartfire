function $(selector) { return document.querySelector(selector); }

/* Basic example */

const parentBasic = $('#vanillaColor'),
      popupBasic = new Picker({
          parent: parentBasic,
          onDone: function(color) {
            map.removeLayer(areaIsolamento);
            areaIsolamento.options.color = color.rgbaString();
            cor = color.rgbaString();
            map.addLayer(areaIsolamento);
        },
      });
popupBasic.onChange = function(color) {
    map.removeLayer(areaIsolamento);
    areaIsolamento.options.color = color.rgbaString();
    cor = color.rgbaString();
    map.addLayer(areaIsolamento);
};
//Open the popup manually:
//popupBasic.openHandler();