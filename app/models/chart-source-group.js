import Ember from 'ember';
import DS from 'ember-data';
import { defaultUnitsForProperty } from './chart-property-config';

export default DS.Model.extend({
  chart: DS.belongsTo('chart-config', {inverse:'groups'}),
  nodeId: DS.attr('number'),
  sourceIds: DS.attr(), // array of source IDs
  title: DS.attr('string'),
  displayName: Ember.computed.alias('title'),
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

  allSourceConfigs: Ember.computed.alias('chart.profile.chartSources'),

  sourceConfigs: Ember.computed('sourceIds.[]', 'allSourceConfigs.[]', function() {
    const sourceIds = this.get('sourceIds');
    return this.get('allSourceConfigs').filter(sourceConfig => {
      return (sourceIds && sourceIds.contains(sourceConfig.get('source')));
    });
  }),

});
