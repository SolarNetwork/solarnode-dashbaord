import Ember from 'ember';

export default Ember.Component.extend({
  selectedSourceId: null,

  sourceConfigsSorting: ['displayName'],
  sortedSourceConfigs: Ember.computed.sort('sourceConfigs', 'sourceConfigsSorting'),

  canSave: Ember.computed(
    'sourceConfigs.@each.{hasDirtyAttributes,isNew}',
    'propConfigs.@each.{hasDirtyAttributes,isNew}',
    function() {
    return (this.get('sourceConfigs').any(function(obj) { return obj.get('hasDirtyAttributes') || obj.get('isNew'); })
        || this.get('propConfigs').any(function(obj) { return obj.get('hasDirtyAttributes') || obj.get('isNew'); })
        );
  }),

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

    save() {
      this.get('sourceConfigs').forEach(obj => {
        obj.save();
      });
      this.get('propConfigs').forEach(obj => {
        obj.save();
      });
    },
  },

});
