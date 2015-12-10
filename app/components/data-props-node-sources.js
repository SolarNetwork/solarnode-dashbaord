import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',

  nodeSourceConfigs: Ember.computed('sourceConfigs.[]', 'nodeConfig', function() {
    const nodeId = this.get('nodeConfig.nodeId');
    const sourceConfigs = this.get('sourceConfigs');
    return sourceConfigs.filterBy('nodeId', nodeId);
  }),

  sourceConfigsSorting: ['displayName'],
  sortedSourceConfigs: Ember.computed.sort('nodeSourceConfigs.[]', 'sourceConfigsSorting'),

  actions : {

    selectSource(sourceConfig) {
      this.sendAction('selectSource', sourceConfig);
    },

  },

});
