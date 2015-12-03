import Ember from 'ember';
import DS from 'ember-data';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';
import ChartSuggestion from './chart-suggestion';

export default DS.Model.extend({
  profile: DS.belongsTo('user-profile', {inverse:'charts'}),
  title: DS.attr('string'),
  type: DS.attr('string'),
  subtype: DS.attr('string'),
  style: DS.attr('string', { defaultValue: 'line' }),
  flags: DS.attr(),
  sourceGroups: DS.hasMany('chart-source-group', {inverse:'chart'}),
  isSettingsVisible: DS.attr('boolean', { defaultValue: true }),

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

  isValid: Ember.computed('isUsePeriod', 'period', 'startDate', 'endDate', function() {
    const isUsePeriod = this.get('isUsePeriod');
    if ( isUsePeriod ) {
      return (this.get('period') > 0);
    }
    const startDate = this.get('startDate');
    const endDate = this.get('endDate');
    return (startDate && endDate && endDate.getTime() > startDate.getTime());
  }),

  groups: Ember.computed('sourceGroups.[]', function() {
    const promise = this.get('sourceGroups').then(sourceGroups => {
      return sourceGroups;
    });
    return DS.PromiseArray.create({promise:promise});
  }),

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
   Get an array of all configured ChartSourceConfig objects.

   @return {Array} Array of ChartSourceConfig objects.
   */
  sourceConfigs: Ember.computed('sourceGroups.@each.sourceConfigs', function() {
    const promise = this.get('sourceGroups').then(sourceGroups => {
      return Ember.RSVP.all(sourceGroups.mapBy('sourceConfigs'));
    }).then(arrays => {
      var merged = Ember.A();
      arrays.forEach(array => {
        array.forEach(item => {
          merged.pushObject(item);
        });
      });
      return merged;
    });
    return DS.PromiseArray.create({promise:promise});
  }),

  /**
   Get an array of all configured ChartPropertyConfig objects.

   @return {Array} Array of ChartPropertyConfig objects.
   */
  propertyConfigs: Ember.computed('sourceGroups.@each.propertyConfigs', function() {
    const promise = this.get('sourceGroups').then(sourceGroups => {
      return Ember.RSVP.all(sourceGroups.mapBy('propertyConfigs'));
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
    const promise = this.get('sourceProperties').then(sProps => {
      var result = null;
      var allSame = sProps.every(function(sProp) {
        if ( !(sProp && sProp.unit && sProp.unitName) ) {
          return true;
        }
        if ( !result ) {
          // first result... take it
          result = {unit:sProp.unit, unitName:sProp.unitName};
          return true;
        }
        if ( result && result.unit === sProp.unit && result.unitName === sProp.unitName ) {
          return true;
        }
        return !result;
      });
      if ( allSame && result ) {
        var scale = this.get('displayScale');
        result.unit = sn.format.displayUnitsForScale(result.unit, scale);
      }
      return (allSame ? result : null);
    });
    return DS.PromiseObject.create({promise:promise});
  }),

  /**
   A transient display scale, which can be set after a chart loads based on the actual data.

   @return {number} The display scale.
  */
  displayScale: 1,

  /**
   Test if a suggestion matches the receiver.

   @param {ChartSuggestion} - The suggestion to compare.
   @return A promise boolean.
   */
  matchesSuggestion(suggestion) {
	  // first check type/subtype
    if ( !(this.get('type') === suggestion.get('type') && this.get('subtype') === suggestion.get('subtype')) ) {
      return Ember.RSVP.resolve(false);
    }

    const suggestionSourceProperties = suggestion.get('sourceProperties');

    // turn source properties array into map of source => prop
    const suggestionSourcePropsObj = suggestionSourceProperties.reduce(function(l, r) {
      l[r.source] = r.prop;
      return l;
    }, {});

    // verify sources are the same (i.e. source + props)
    const promise = this.get('sourceProperties').then(sProps => {
      const sPropsCount = sProps.get('length');
      if ( sPropsCount !== suggestionSourceProperties.length ) {
        return false;
      }
      return sProps.every(function(sProp) {
        return (suggestionSourcePropsObj[sProp.source] && suggestionSourcePropsObj[sProp.source] === sProp.prop);
      });
    });
    return promise;//DS.PromiseObject.create({promise:promise});
  }

});
