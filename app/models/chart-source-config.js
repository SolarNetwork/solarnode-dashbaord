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
   Get an array of all ChartPropertyConfig.property values.
   */
  properties: Ember.computed('props.@each.property', function() {
    const promise = this.get('props').then(props => {
      return Ember.RSVP.all(props.mapBy('property'));
    });
    return DS.PromiseArray.create({promise:promise});
  })

});
