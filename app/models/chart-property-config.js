import Ember from 'ember';
import DS from 'ember-data';

export function defaultUnitsForProperty(prop) {
  var unit, unitName;
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
  return {prop: prop, unit: unit, unitName: unitName};
}

export default DS.Model.extend({
  profile: DS.belongsTo('user-profile', {inverse:'chartProperties'}),
  charts: DS.hasMany('chart-config', {inverse:'properties'}),

  source: DS.attr('string'),
  prop: DS.attr('string'),
  title: DS.attr('string'),
  unit: DS.attr('string'),
  unitName: DS.attr('string'),
  color: DS.attr('string', { defaultValue : '#f7c819' }),

  /**
   Toggle to indicate the property should not appear in charts when drawn.
   */
  isHidden: DS.attr('boolean'),

  displayName: Ember.computed('title', 'property', function() {
    const property = this.get('property');
    const unit = property.unit;
    const prop = property.prop;
    const title = this.get('title');
    var name = (title && title !== '' ? title : prop);
    if ( unit ) {
      if ( name ) {
        name += ' - ';
      }
      name += unit;
    }
    return name;
  }),

  /**
   Get a plain object version of this object. Default values for properties will
   be returned if possible.
   */
  property: Ember.computed('source', 'prop', 'unit', 'unitName', 'color', function() {
    const prop = this.get('prop');
    var unit = this.get('unit');
    var unitName = this.get('unitName');
    if ( prop && !(unit || unitName) ) {
      const defaultUnits = defaultUnitsForProperty(prop);
      unit = unit || defaultUnits.unit;
      unitName = unitName || defaultUnits.unitName;
    }
    return {
      source: this.get('source'),
      prop: prop,
      unit: unit,
      unitName: unitName,
      color: this.get('color')
    };
  }),

});
