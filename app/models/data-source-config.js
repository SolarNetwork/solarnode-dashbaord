import Ember from 'ember';

/**
 A source with associated properties.
 */
export default Ember.Object.extend({
  sourceConfig: null,
  sourceId: Ember.computed.readOnly('sourceConfig.source'),

  propConfigs: Ember.computed('sourceId', 'allPropConfigs.@each.source', function() {
    const sourceId = this.get('sourceId');
    const allPropConfigs = this.get('allPropConfigs');
    return allPropConfigs.filterBy('source', sourceId);
  }),

});
