import Ember from 'ember';
import DataSourceConfig from '../models/data-source-config';

export default Ember.Component.extend({
  tagName: 'fieldset',
  canRemove: false,

  profile: Ember.computed.alias('sourceConfig.profile'),

  source: Ember.computed.alias('sourceConfig.source'),
  sourceProperties: Ember.computed('propConfigs.@each.source', 'source', function() {
    const sourceId = this.get('source');
    return this.get('propConfigs').filterBy('source', sourceId);
  }),

  canRemoveProperty: Ember.computed.gt('chartConfig.properties.length', 1),

  actions : {
    togglePropertyVisibility(prop) {
      this.sendAction('togglePropertyVisibility', prop);
      //prop.toggleProperty('isHidden');
    },

   setPropertyColor(prop, color) {
      this.sendAction('setPropertyColor', prop, color);
   },

    removeProperty(prop) {
      this.sendAction('removeProperty', prop.get('id'));
    },

  },

});
