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

  showChildOutlet: Ember.computed.or('selectedSourceId', 'showingAddNodeForm'),

  init() {
    this._super(...arguments);
    this.eventBus.subscribe('data-props.source.DataSourceConfigLoaded', this, 'onDataSourceConfigLoaded');
    this.eventBus.subscribe('data-props.addNode.AddNodeFormLoaded', this, 'onAddNodeFormLoaded');
  },

  destroy() {
    this.eventBus.unsubscribe('data-props.source.DataSourceConfigLoaded');
    this.eventBus.unsubscribe('data-props.addNode.AddNodeFormLoaded');
    this._super(...arguments);
  },

  onDataSourceConfigLoaded(dataSourceConfig) {
    this.set('selectedSourceId', dataSourceConfig.get('sourceId'));
    this.set('showingAddNodeForm', false);
  },

  onAddNodeFormLoaded() {
    this.set('selectedSourceId', null);
    this.set('showingAddNodeForm', true);
  },

  actions : {
    selectSource(sourceConfig) {
      const curr = this.get('selectedSourceId');
      const dest = sourceConfig.get('source');
      if ( curr !== dest ) {
        this.set('selectedSourceId', sourceConfig.get('source'));
        this.set('showingAddNodeForm', false);
        this.sendAction('selectedSource', sourceConfig);
      }
    },

    hideDataPropHelp() {
      const profile = this.get('profile');
      if ( profile ) {
        profile.set('isHideDataPropHelp', true);
        profile.save();
      }
    },

    showAddNewNodeForm() {
      this.set('selectedSourceId', null);
      this.set('showingAddNodeForm', true);
      this.sendAction('showAddNewNodeForm');
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
