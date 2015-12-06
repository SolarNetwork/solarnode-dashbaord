import Ember from 'ember';

export default Ember.Component.extend({
  selectedSourceId: null,

  init() {
    this._super(...arguments);
    this.eventBus.subscribe('data-props.source.DataSourceConfigLoaded', this, 'onDataSourceConfigLoaded');
  },

  destroy() {
    this.eventBus.unsubscribe('data-props.source.DataSourceConfigLoaded');
    this._super(...arguments);
  },

  onDataSourceConfigLoaded(dataSourceConfig) {
    this.set('selectedSourceId', dataSourceConfig.get('sourceId'));
  },

  actions : {
    selectSource(sourceConfig) {
      this.set('selectedSourceId', sourceConfig.get('source'));
      this.sendAction('selectedSource', sourceConfig);
    },

    hideDataPropHelp() {
      const profile = this.get('profile');
      if ( profile ) {
        profile.set('isHideDataPropHelp', true);
        profile.save();
      }
    },

  },

});
