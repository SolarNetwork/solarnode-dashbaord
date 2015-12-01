import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  chart: DS.belongsTo('chart-config', {inverse:'sourceGroups'}),
  sources: DS.hasMany('chart-source-config', {inverse:'group'}),
  flags: DS.attr(),
  scaleFactor: DS.attr('number', {default: 1}),
  groupProp: DS.attr('string'),

  /**
   Get an array of all configured sources and properties.

   @return {Array} Array of ChartPropertyConfig objects
   */
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
   Get an array of all configured ChartPropertyConfig objects.

   @return {Array} Array of ChartPropertyConfig objects.
   */
  propertyConfigs: Ember.computed('sources.@each.propertyConfigs', function() {
    const promise = this.get('sources').then(sources => {
      return Ember.RSVP.all(sources.mapBy('propertyConfigs'));
    }).then(arrays => {
      var merged = Ember.A();
      arrays.forEach(array => {
        merged.pushObjects(array);
      });
      return merged;
    });
    return DS.PromiseArray.create({promise:promise});
  }),

});
