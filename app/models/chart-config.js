import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  profile: DS.belongsTo('user-profile', {inverse:'charts'}),
  title: DS.attr('string'),
  type: DS.attr('string'),
  subtype: DS.attr('string'),
  flags: DS.attr(),
  sources: DS.hasMany('source-profile', {inverse:null}),
  startDate: DS.attr('date'),
  endDate: DS.attr('date'),
  aggregate: DS.attr('string'),

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
