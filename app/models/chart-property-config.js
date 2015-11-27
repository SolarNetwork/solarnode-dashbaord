import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  source: DS.belongsTo('chart-source-config', {inverse:'props'}),
  prop: DS.attr('string'),
  unit: DS.attr('string'),
  unitName: DS.attr('string'),
  color: DS.attr('string'),

  property: Ember.computed('source', 'prop', 'unit', 'unitName', function() {
    var prop = this.get('prop');
    var unit = this.get('unit');
    var unitName = this.get('unitName');
    var source = this.get('source');
    if ( prop && !(unit || unitName) ) {
      if ( prop === 'watts' ) {
        unit = unit || 'W';
        unitName = unitName || 'watts';
      } else if ( prop.search(/wattHours/i) !== -1 ) {
        unit = unit || 'Wh';
        unitName = unitName || 'watt hours';
      } else if ( prop.search(/volt/i) !== -1 ) {
        unit = unit || 'V';
        unitName = unitName || 'volts';
      } else if ( prop.search(/current/i) !== -1 ) {
        unit = unit || 'A';
        unitName = unitName || 'amps';
      } else if ( prop.search(/frequency/i) !== -1 ) {
        unit = unit || 'Hz';
        unitName = unitName || 'hertz';
      } else if ( prop.search(/temp/i) !== -1 ) {
        unit = unit || '°C';
        unitName = unitName || 'celsius';
      }
    }
    return {source:(source ? source.get('source') : null), prop:prop, unit:unit, unitName:unitName};
  })
});
