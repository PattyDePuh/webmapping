/**
 * Definition of ol.interaction.ModifyWithEvents
 * Script to extend ol.interaction.modify to emit custom events like ol.interaction.draw emits "drawstart" and "drawend"
 * Implementation of ol.ModifyEvent via ol.interaction.ModifyWithEvents
 */

goog.provide('ol.ModifyEvent');
goog.provide('ol.ModifyEventType');
goog.provide('ol.interaction.ModifyWithEvents');

goog.require('goog.events.Event');
goog.require('ol.Feature');
goog.require('ol.source.Vector');
goog.require('ol.interaction.Modify');


/**
 * @enum {string}
 */
ol.ModifyEventType = {
    /**
     * Triggered upon feature modification starts
     * @event ol.ModifyEvent#modifystart
     * @api experimental
     */
    MODIFYSTART: 'modifystart',

    /**
     * Triggered upon feature modification ends
     * @event ol.ModifyEvent#modifyend
     * @api experimental
     */
    MODIFYEND: 'modifyend',

    /**
     * Triggered when feature is selected for geometry addition
     * @event ol.ModifyEvent#beforefeatureadd
     * @api experimental
     */
    FEATUREADD: 'featureadd',

    /**
     * Triggered when feature is selected for geometry subtraction
     * @event ol.ModifyEvent#beforefeatureadd
     * @api experimental
     */
    FEATUREREMOVE: 'featureremove'
};



/**
 * @classdesc
 * Events emitted by {@link ol.interaction.Modify} instances are instances of
 * this type.
 *
 * @constructor
 * @extends {goog.events.Event}
 * @implements {oli.ModifyEvent}
 * @param {ol.ModifyEventType} type Type.
 * @param {ol.Feature} feature The feature drawn.
 */
ol.ModifyEvent = function(type, featureCollection) {
    goog.base(this, type);

    /**
     * Collection of features being modified.
     * @type {ol.Feature}
     * @api stable
     */
    this.featureCollection = featureCollection;
};
goog.inherits(ol.ModifyEvent, goog.events.Event);



/**
 * @classdesc
 * Interaction for modifying vector data while emitting necessary events.
 *
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @param {olx.interaction.ModifyOptions} options Options.
 * @api stable
 */
ol.interaction.ModifyWithEvents = function(options) {

    goog.base(this, options);

    // Overriding RBush with RBushWithEvents
    this.rBush_ = new ol.structs.RBushWithEvents();

    this.featuresBeingModified_ = null;

    /**
     * dispatchFeatureEvent: dispatching feature modify events while assigning fid
     * @param type feature type, features featureCollection
     */
    this.dispatchFeatureEvent = function(type, features) {
        features.forEach(function(feature){
            if(feature.fid == undefined || !feature.fid) {
                feature.fid = goog.getUid(feature);
                feature.setId(feature.fid);
            }
        });

        this.dispatchEvent(new ol.ModifyEvent(type,
            features));
    }

    /**
     * @inheritDoc
     */
    this.handlePointerDown = function(evt) {
        var eventHandled = goog.base(this, 'handlePointerDown', evt);
        if(eventHandled) {
            this.dispatchFeatureEvent(ol.ModifyEventType.MODIFYSTART,
                this.features_);
        }
        return eventHandled;
    }

    /**
     * @inheritDoc
     */
    this.addFeature_ = function(feature) {
        goog.base(this, 'addFeature_', feature);

        this.dispatchEvent(new ol.ModifyEvent(ol.ModifyEventType.FEATUREADD,
            feature));
    };

    /**
     * @inheritDoc
     */
    this.handleFeatureRemove_ = function(evt) {
        goog.base(this, 'handleFeatureRemove_', evt);

        if (!goog.isNull(this.vertexFeature_) && this.features_.getLength() === 0) {
            this.dispatchEvent(new ol.ModifyEvent(ol.ModifyEventType.FEATUREREMOVE,
                evt.element));
        }
    }

    /**
     * @inheritDoc
     */
    this.handlePointerUp = function(evt) {
        var returnedValue = goog.base(this, 'handlePointerUp', evt);
        if(this.dragSegments_.length) {
            this.dispatchFeatureEvent(ol.ModifyEventType.MODIFYEND,
                this.features_);
        }
        return returnedValue;
    };
};
goog.inherits(ol.interaction.ModifyWithEvents, ol.interaction.Modify);