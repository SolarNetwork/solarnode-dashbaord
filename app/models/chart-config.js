import Ember from 'ember';
import DS from 'ember-data';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

export default DS.Model.extend({
  profile: DS.belongsTo('user-profile', {inverse:'charts'}),
  title: DS.attr('string'),
  type: DS.attr('string'),
  subtype: DS.attr('string'),
  style: DS.attr('string', { defaultValue: 'line' }),
  flags: DS.attr(),
  sourceGroups: DS.hasMany('chart-source-group', {inverse:'chart'}),

  isUsePeriod: DS.attr('boolean', { defaultValue: true }),
  period: DS.attr('number', { defaultValue: 1 }),
  periodType: DS.attr('string', { defaultValue: 'day'}),

  periodAggregate: Ember.computed('periodType', function() {
    const periodType = this.get('periodType');
    if ( periodType === 'year' ) {
      return 'Month';
    } else if ( periodType === 'day' ) {
      return 'Hour';
    } else if ( periodType === 'hour' ) {
      return 'FiveMinute';
    } else {
      // default to Day
      return 'Day';
    }
  }),

  startDate: DS.attr('date'),
  endDate: DS.attr('date'),

  aggregate: DS.attr('string', { defaultValue: 'Day' }),

  /**
   Get an array of all configured sources and properties.

   @return {Array} Array of objects like <code>{source:X, prop:Y}</code>
   */
  sourceProperties: Ember.computed('sourceGroups.@each.sourceProperties', function() {
    const promise = this.get('sourceGroups').then(sourceGroups => {
      return Ember.RSVP.all(sourceGroups.mapBy('sourceProperties'));
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
   Get a single, chart-wide unit metadata to use, if all configured properties use the same unit.

   @return {Object} a unit metadata object, like <code>{unit:'W', unitName:'watts'}</code>
   */
  unit: Ember.computed('sourceProperties', 'displayScale', function() {
    const sProps = this.get('sourceProperties');
    var result = null;
    var allSame = sProps.every(function(sProp) {
      const meta = sProp.prop;
      if ( !(meta && meta.unit && meta.unitName) ) {
        return true;
      }
      if ( !result ) {
        // first result... take it
        result = {unit:meta.unit, unitName:meta.unitName};
        return true;
      }
      if ( result && (result.unit !== meta.unit || result.unitName !== meta.unitName) ) {
        return false;
      }
    });
    if ( allSame && result ) {
      var scale = this.get('displayScale');
      result.unit = sn.format.displayUnitsForScale(result.unit, scale);
    }
    return (allSame ? result : null);
  }),

  /**
   A transient display scale, which can be set after a chart loads based on the actual data.

   @return {number} The display scale.
  */
  displayScale: 1

});
