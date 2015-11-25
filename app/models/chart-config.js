import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  profile: DS.belongsTo('user-profile', {inverse:'charts'}),
  title: DS.attr('string'),
  type: DS.attr('string'),
  subtype: DS.attr('string'),
  flags: DS.attr(),
  sources: DS.hasMany('source-profile', {inverse:null}),

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

  sourceProperties: Ember.computed('sources.@each.props', function() {
    // arrays is array of arrays
    var arrays = this.get('sources').map(function(source) {
      var props = source.get('props');
      if ( props ) {
        return props.map(function(prop) {
          return {source:source.get('source'), prop:prop};
        });
      }
      return [];
    });
    // merge array of arrays into single array
    return [].concat.apply([], arrays);
  })

});
