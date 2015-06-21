/**
 * Class providing functionallity to edit features displayed on the map.
 * @constructor
 * @param {ol.Map} map The OpenLayers map which should be edtitable.
 */

// namespace edit
var edit = {};

edit.Toolbar = function(map) {
  // do initialization here
  this.interactions = new edit.Interactions();

  this.map = map;
  this.activeTool = null;

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
      
      this.activateModify();

    } else {
      this.activeTool = null;
      // deselect all
      this.interactions.select.getFeatures().clear();
      // deactivate all interactions
      this.interactions.setActive(false);
    }
  },
  activateModify: function(opt_el) {
    var el = opt_el || $("#modify-tool");

    // do nothing if already selected
    if (this.activeTool !== "modify") {
      this.activeTool = "modify";

      $(".edit button").removeClass("active");
      el.addClass("active");

      this.interactions.setActive(false);
      this.interactions.select.setActive(true);
      this.interactions.modify.setActive(true);
    }
  },
  activateMove: function(opt_el) {
    var el = opt_el || $("#move-tool");
    // do nothing if already selected
    if (this.activeTool !== "move") {
      this.activeTool = "move";

      $(".edit button").removeClass("active");
      el.addClass("active");

      this.interactions.setActive(false);
      this.interactions.select.setActive(true);
      this.interactions.move.setActive(true);
    }
  },
  activateDelete: function(opt_el) {
    var el = opt_el || $("#delete-tool");
    // do nothing if already selected
    if (this.activeTool !== "delete") {
      this.activeTool = "delete";

      $(".edit button").removeClass("active");
      el.addClass("active");

      this.interactions.setActive(false);
      this.interactions.select.setActive(true);
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
      _this.activateModify($(this));
    });
    // move tool
    $("#move-tool").click(function() {
      _this.activateMove($(this));
    });
    // delete tool
    $("#delete-tool").click(function() {
      _this.activateDelete($(this));
    });

    // abort button
    $("abort").click(function() {
      _this.toggleToolbar();
    })
  }
});

edit.Interactions = function() {
  this.select = new ol.interaction.Select();
  this.modify = new ol.interaction.Modify({
    features: this.select.getFeatures(),
    // the SHIFT key must be pressed to delete vertices, so
    // that new vertices can be drawn at the same position
    // of existing vertices
    deleteCondition: function(event) {
      return ol.events.condition.shiftKeyOnly(event) &&
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
