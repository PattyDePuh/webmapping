/**
 * Class providing functionallity to edit features displayed on the map.
 * @constructor
 * @param {ol.Map} map The OpenLayers map which should be edtitable.
 */

var Interactions = function() {
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
};
Interactions.prototype.setActive = function(active) {
  _.each(this, function(interaction) {
    interaction.setActive(active);
  });
};


var EditToolbar = function(map) {
  // do initialization here
  this.interactions = new Interactions();

  this.map = map;
  this.activeTool = null;

  // add all interactions to map, but disable them at the beginning
  _.each(this.interactions, function(interaction) {
    this.map.addInteraction(interaction);
    interaction.setActive(false);
  }, this);

  this.registerListeners();
};

$.extend(EditToolbar.prototype, {
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

