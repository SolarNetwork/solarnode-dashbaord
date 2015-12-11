import Ember from 'ember';
import DataSourceConfig from '../models/data-source-config';

export default Ember.Component.extend({
  tagName: 'fieldset',
  canRemove: false,

  profile: Ember.computed.alias('sourceConfig.profile'),

  nodeId: Ember.computed.alias('sourceGroup.nodeId'),
  source: Ember.computed.alias('sourceConfig.source'),
  sourceProperties: Ember.computed('propConfigs.@each.source', 'source', 'nodeId', function() {
    const nodeId = this.get('nodeId');
    const sourceId = this.get('source');
    return this.get('propConfigs').filter(function(propConfig) {
      return (nodeId === propConfig.get('nodeId') && sourceId === propConfig.get('source'));
    });
  }),

  canRemoveProperty: Ember.computed.gt('chartConfig.properties.length', 1),

  actions : {
    togglePropertyVisibility(prop) {
      this.sendAction('togglePropertyVisibility', prop);
    },

   setPropertyColor(prop, color) {
      this.sendAction('setPropertyColor', prop, color);
   },

    removeProperty(prop) {
      this.sendAction('removeProperty', prop.get('id'));
    },

  },

});
