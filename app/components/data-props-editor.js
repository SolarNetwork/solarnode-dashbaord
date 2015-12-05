import Ember from 'ember';

export default Ember.Component.extend({
  selectedSourceId: null,

  init() {
    this._super(...arguments);
    this.eventBus.subscribe('data-props.source.SourceConfigLoaded', this, 'onSourceConfigLoaded');
  },

  destroy() {
    this.eventBus.unsubscribe('data-props.source.SourceConfigLoaded');
    this._super(...arguments);
  },

  onSourceConfigLoaded(sourceConfig) {
    this.set('selectedSourceId', sourceConfig.get('source'));
  },

  actions : {
    selectSource(sourceConfig) {
      this.set('selectedSourceId', sourceConfig.get('source'));
      this.sendAction('selectedSource', sourceConfig);
    },
  },

});
