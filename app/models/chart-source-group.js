import Ember from 'ember';
import DS from 'ember-data';
import { defaultUnitsForProperty } from './chart-property-config';

export default DS.Model.extend({
  chart: DS.belongsTo('chart-config', {inverse:'groups'}),
  sourceIds: DS.attr(), // array of source IDs
  title: DS.attr('string'),
  flags: DS.attr(),
  scaleFactor: DS.attr('number', {default: 1}),

  groupProp: DS.attr('string'),
  groupUnit: DS.attr('string'),
  groupUnitName: DS.attr('string'),

  /**
   Get a plain object version of this object. Default values for properties will
   be returned if possible.
   */
  groupProperty: Ember.computed('groupProp', 'groupUnit', 'groupUnitName', function() {
    var prop = this.get('groupProp');
    var unit = this.get('groupUnit');
    var unitName = this.get('groupUnitName');
    if ( prop && !(unit || unitName) ) {
      const defaultUnits = defaultUnitsForProperty(prop);
      unit = unit || defaultUnits.unit;
      unitName = unitName || defaultUnits.unitName;
    }
    return {
      groupId: this.get('id'),
      prop: prop,
      unit: unit,
      unitName: unitName
    };
  }),

  /**
   Get an array of all configured sources and properties.

   @return {Array} Array of ChartPropertyConfig objects
   *
  sourceProperties: Ember.computed('sources.@each.properties', function() {
    const promise = this.get('sources').then(sources => {
      return Ember.RSVP.all(sources.mapBy('properties'));
    }).then(arrays => {
      var merged = Ember.A();
      arrays.forEach(array => {
        merged.pushObjects(array);
      });
      return merged;
    });
    return DS.PromiseArray.create({promise:promise});
  }),

  /**
   Get an array of all configured ChartSourceConfig objects.

   @return {Array} Array of ChartSourceConfig objects.
   *
  sourceConfigs: Ember.computed('sources.@each.{title,scaleFactor,groupProp,groupUnit,groupUnitName}', function() {
    const promise = this.get('sources');
    return DS.PromiseArray.create({promise:promise});
  }),

  /**
   Get an array of all configured ChartPropertyConfig objects.

   @return {Array} Array of ChartPropertyConfig objects.
   *
  propertyConfigs: Ember.computed('sources.@each.propertyConfigs', function() {
    const promise = this.get('sources').then(sources => {
      return Ember.RSVP.all(sources.mapBy('propertyConfigs'));
    }).then(arrays => {
      var merged = Ember.A();
      arrays.forEach(array => {
        array.forEach(obj => {
          merged.pushObject(obj);
        });
      });
      return merged;
    });
    return DS.PromiseArray.create({promise:promise});
  }),
  */
});
