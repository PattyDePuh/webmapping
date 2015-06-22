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

  updateTemp: function(event, context) {
    event.features.forEach(function(feature) {
      // if it doesnt already exist in temp
      if (!(feature.getId() in this.temp)) {
        // save original geometry in temp
        this.temp[feature.getId()] = {
          current: feature,
          oldGeom: feature.getGeometry().clone()    // deep copy
        };
      }
    }, context);
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

    this.interactions.modify.on('modifystart', function(e) { _this.updateTemp(e, _this); });
    this.interactions.move.on('modifystart', function(e) { _this.updateTemp(e, _this); });

    this.interactions.modify.on('modifyend', function(e) {
      console.log("modifyend!");
    });

  }
});

/**
 * Class holding all the map interactions.
 * @constructor
 * @extends {Object}
 */
edit.Interactions = function() {
  this.select = new ol.interaction.Select();
  this.modify = new ol.interaction.ModifyWithEvents({
    features: this.select.getFeatures(),
    // the ALT key must be pressed to delete vertices, so
    // that new vertices can be drawn at the same position
    // of existing vertices
    deleteCondition: function(event) {
      return ol.events.condition.altKeyOnly(event) &&
          ol.events.condition.singleClick(event);
    }
  });
  this.move = new ol.interaction.Drag(this.select.getFeatures());
};
edit.Interactions.prototype.setActive = function(active) {
  _.each(this, function(interaction) {
    interaction.setActive(active);
  });
};
