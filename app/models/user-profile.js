import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  user: DS.belongsTo('user'),
  isSetup: DS.attr(),
  charts: DS.hasMany('chart-config', {inverse:'profile'}),
  sources: DS.hasMany('source-profile', {inverse:'profile'}),

  hasCharts: Ember.computed('charts.[]', function() {
    return (this.get('charts.length') > 0);
  }),

  sourceProperties: Ember.computed('sources.@each.props', function() {
    var arrays = this.get('sources').map(function(source) {
      var props = source.get('props');
      if ( props ) {
        return props.map(function(prop) {
          return {source:source.get('source'), prop:prop};
        });
      }
      return [];
    });
    return [].concat.apply([], arrays);
  }),

  /**
   * Get an array of chart source/property objects in the form of {source:foo prop:bar}.
   */
  chartSourceProperties: Ember.computed('charts.@each.sourceProperties', function() {
    const promise = this.get('charts').then(charts => {
      return Ember.RSVP.all(charts.mapBy('sourceProperties'));
    }).then(arrays => {
      var merged = Ember.A();
      arrays.forEach(array => {
        merged.pushObjects(array);
      });
      return merged;
    });
    return DS.PromiseArray.create({promise:promise});
  })

});
