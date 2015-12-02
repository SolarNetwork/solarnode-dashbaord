import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  source: DS.attr('string'),
  title: DS.attr('string'),
  displayName: Ember.computed('source', 'title', {
    get() {
      const title = this.get('title');
      return (title ? title : this.get('source'));
    },
    set(key, value) {
      this.set('title', value);
      return value;
    }
  }),
  props: DS.hasMany('chart-property-config', {inverse:'source'}),
  group: DS.belongsTo('chart-source-group', {inverse:'sources'}),

  /**
   A shortcut to the first ChartPropertyConfig. Useful for groups with a single property.
   */
  prop: Ember.computed('props.[]', function() {
    const promise = this.get('props').then(props => {
      return props.get('firstObject');
    });
    return DS.PromiseObject.create({promise:promise});
  }),

  /**
   Get an array of all ChartPropertyConfig.property values.
   */
  properties: Ember.computed('props.@each.property', function() {
    const promise = this.get('props').then(props => {
      return Ember.RSVP.all(props.mapBy('property'));
    });
    return DS.PromiseArray.create({promise:promise});
  }),

  /**
   Get an array of all configured ChartPropertyConfig objects.

   @return {Array} Array of ChartPropertyConfig objects.
   */
  propertyConfigs: Ember.computed('props.@each.{color,unit,unitName}', function() {
    const promise = this.get('props').then(props => {
      return props.slice();// turn into real Array
    });
    return DS.PromiseArray.create({promise:promise});
  }),

});
