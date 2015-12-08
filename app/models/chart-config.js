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
  properties: DS.hasMany('chart-property-config', {inverse:'charts'}),
  groups: DS.hasMany('chart-source-group', {inverse:'chart'}),

  sources: Ember.computed.mapBy('properties', 'source'),
  uniqueSources: Ember.computed.uniq('sources'),

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

  /**
   A transient display scale, for example <code>1000</code> for <em>kilo</em>.
   This can be set after a chart loads based on the actual data.

   @return {number} The display scale.
  */
  displayScale: 1,

  isValid: Ember.computed('isUsePeriod', 'period', 'startDate', 'endDate', function() {
    const isUsePeriod = this.get('isUsePeriod');
    if ( isUsePeriod ) {
      return (this.get('period') > 0);
    }
    const startDate = this.get('startDate');
    const endDate = this.get('endDate');
    return (startDate && endDate && endDate.getTime() > startDate.getTime());
  }),

  /**
   Get a single, chart-wide unit metadata to use, if all configured properties use the same unit.

   @return {Object} a unit metadata object, like <code>{unit:'W', unitName:'watts'}</code>
   */
  unit: Ember.computed('properties.@each.property', 'displayScale', function() {
    // FIXME: handle groupProp
    const promise = this.get('properties').then(propConfigs => {
      var result = null;
      var allSame = propConfigs.every(propConfig => {
        const property = propConfig.get('property');
        const unit = property.unit;
        const unitName = property.unitName;
        if ( !(unit && unitName) ) {
          return true;
        }
        if ( !result ) {
          // first result... take it
          result = {unit:unit, unitName:unitName};
          return true;
        }
        if ( result && result.unit === unit && result.unitName === unitName ) {
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
    const promise = this.get('properties').then(propConfigs => {
      const propConfigsCount = propConfigs.get('length');
      if ( propConfigsCount !== suggestionSourceProperties.length ) {
        return false;
      }
      return propConfigs.every(function(propConfig) {
        const sourceId = propConfig.get('source');
        const prop = propConfig.get('prop');
        return (suggestionSourcePropsObj[sourceId] && suggestionSourcePropsObj[sourceId] === prop);
      });
    });
    return promise;
  }

});
