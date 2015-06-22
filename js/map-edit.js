// namespace edit
var edit = {};

/**
 * Class providing functionallity to edit features displayed on the map.
 * @constructor
 * @param {ol.Map} map The OpenLayers map which should be editable.
 * @param {ol.source.Vector} sources All the editable sources.
 */
edit.Toolbar = function(map, sources) {
  // do initialization here
  this.map = map;
  this.sources = sources;

  this.interactions = new edit.Interactions();
  this.activeTool = null;
  this.temp = {};

  // add all interactions to map, but disable them at the beginning
  _.each(this.interactions, function(interaction) {
    this.map.addInteraction(interaction);
    interaction.setActive(false);
  }, this);

  this.registerListeners();
};

$.extend(edit.Toolbar.prototype, {
  // class methods here
  toggleToolbar: function(opt_el) {
    var el = opt_el || $("#edit");

    el.parent().toggleClass("active");
    $(".edit").fadeToggle(120);               // fade in/out the edit toolbar
    // $("#map").focus();                        // set focus to map

    if (this.activeTool == null) {
      this.activate("modify");
    } else {
      this.cancel();
    }
  },
  activate: function(type) {
    // do nothing if already selected
    if (this.activeTool !== type) {
      this.activeTool = type;
      var el = $("#"+type+"-tool");

      $(".edit button").removeClass("active");
      el.addClass("active");

      this.interactions.setActive(false);
      this.interactions.select.setActive(true);
      this.interactions[type].setActive(true);
    }
  },

  cancel: function() {
    this.activeTool = null;
    // deselect all
    this.interactions.select.getFeatures().clear();
    // deactivate all interactions
    this.interactions.setActive(false);

    // restore all geometries
    if (! _.isEmpty(this.temp)) {
      // var source = _.find(this.sources, function(source) {  });

      _.each(this.temp, function(el, fid) {
        el.current.setGeometry(el.oldGeom);
      }, this);

      // reset temp
      this.temp = {};
    }
  },

  save: function(el) {

  },

  registerListeners: function() {
    var _this = this;

    // main click
    $("#edit").click(function() {
      _this.toggleToolbar($(this));
      return false;
    });

    // edit tool
    $("#modify-tool").click(function() {
      _this.activate("modify");
    });
    // move tool
    $("#move-tool").click(function() {
      _this.activate("move");
    });

    // cancel button
    $("#cancel").click(function() {
      _this.toggleToolbar();
    });

    this.interactions.modify.on('modifystart', function(e) {
      console.log("modify start!");
      e.featureCollection.forEach(function(feature) {
        // if it doesnt already exist in temp
        if (!(feature.getId() in _this.temp)) {
          // save original geometry in temp
          console.log("added to temp!");
          _this.temp[feature.getId()] = {
            current: feature,
            oldGeom: feature.getGeometry().clone()    // deep copy
          };
        }
      });
    });

    this.interactions.modify.on('modifyend', function(e) {
      console.log("modifyend!");
    });

    // select event listener
    // this.interactions.select.on('select', function(e) {
    //   _.each(e.selected, function(feature) {
    //     // if it doesnt already exist in temp
    //     if (!(feature.getId() in _this.temp)) {
    //       // save original geometry in temp
    //       _this.temp[feature.getId()] = feature.getGeometry();
    //     }
    //   });
    // });
  }
});

/**
 * Class holding all the map interactions.
 * @constructor
 * @extends {Object}
 */
edit.Interactions = function() {
  this.select = new ol.interaction.Select({
    condition: ol.events.condition.click
  });
  this.modify = new ol.interaction.ModifyWithEvents({
    features: this.select.getFeatures(),
    // the SHIFT key must be pressed to delete vertices, so
    // that new vertices can be drawn at the same position
    // of existing vertices
    deleteCondition: function(event) {
      return ol.events.condition.altKeyOnly(event) &&
          ol.events.condition.singleClick(event);
    }
  });
  this.move = new edit.Drag(this.select.getFeatures());
};
edit.Interactions.prototype.setActive = function(active) {
  _.each(this, function(interaction) {
    interaction.setActive(active);
  });
};


/**
 * Move/drag interaction.
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
edit.Drag = function(features) {

  ol.interaction.Pointer.call(this, {
    handleDownEvent: edit.Drag.prototype.handleDownEvent,
    handleDragEvent: edit.Drag.prototype.handleDragEvent,
    handleMoveEvent: edit.Drag.prototype.handleMoveEvent,
    handleUpEvent: edit.Drag.prototype.handleUpEvent
  });

  /**
   * @type {ol.Pixel}
   * @private
   */
  this.coordinate_ = null;

  /**
   * @type {string|undefined}
   * @private
   */
  this.cursor_ = 'pointer';

  /**
   * @type {ol.Collection.<ol.Feature>}
   * @private
   */
  this.features_ = features;

  /**
   * @type {string|undefined}
   * @private
   */
  this.previousCursor_ = undefined;

};
ol.inherits(edit.Drag, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
edit.Drag.prototype.handleDownEvent = function(evt) {
  var map = evt.map;

  var feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      });

  if (feature) {
    this.coordinate_ = evt.coordinate;
  }

  return !!feature;
};

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
edit.Drag.prototype.handleDragEvent = function(evt) {
  var map = evt.map;

  var feature = map.forEachFeatureAtPixel(evt.pixel,
    function(feature, layer) {
      return feature;
    });

  var deltaX = evt.coordinate[0] - this.coordinate_[0];
  var deltaY = evt.coordinate[1] - this.coordinate_[1];

  this.features_.forEach(function(feature) {
    var geometry = /** @type {ol.geom.SimpleGeometry} */
      (feature.getGeometry());
    geometry.translate(deltaX, deltaY);
  }, this);

  this.coordinate_[0] = evt.coordinate[0];
  this.coordinate_[1] = evt.coordinate[1];
};

/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
edit.Drag.prototype.handleMoveEvent = function(evt) {
  if (this.cursor_) {
    var map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
          return feature;
        });
    var element = evt.map.getTargetElement();
    if (feature) {
      if (element.style.cursor != this.cursor_) {
        this.previousCursor_ = element.style.cursor;
        element.style.cursor = this.cursor_;
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
};

/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
edit.Drag.prototype.handleUpEvent = function(evt) {
  this.coordinate_ = null;
  // this.features_ = null;
  return false;
};
