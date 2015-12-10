import Ember from 'ember';

export default Ember.Component.extend({
  selectedNodeConfig: null,
  selectedSourceConfig: null,

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

  showChildOutlet: Ember.computed.or('selectedSourceConfig', 'showingAddNodeForm'),

  init() {
    this._super(...arguments);
    this.eventBus.subscribe('data-props.source.DataSourceConfigLoaded', this, 'onDataSourceConfigLoaded');
    this.eventBus.subscribe('data-props.addNode.AddNodeFormLoaded', this, 'onAddNodeFormLoaded');
    this.eventBus.subscribe('data-props.addNode.NodeAdded', this, 'onNodeAdded');
  },

  destroy() {
    this.eventBus.unsubscribe('data-props.source.DataSourceConfigLoaded');
    this.eventBus.unsubscribe('data-props.addNode.AddNodeFormLoaded');
    this.eventBus.unsubscribe('data-props.addNode.NodeAdded');
    this._super(...arguments);
  },

  onDataSourceConfigLoaded(dataSourceConfig) {
    const sourceConfig = dataSourceConfig.get('sourceConfig');
    const nodeId = sourceConfig.get('nodeId');
    sourceConfig.get('profile.nodes').then(nodeConfigs => {
      const nodeConfig = nodeConfigs.findBy('nodeId', nodeId);
      this.setProperties({
        selectedNodeConfig: nodeConfig,
        selectedSourceConfig: sourceConfig,
        showingAddNodeForm: false,
      });
    });
  },

  onAddNodeFormLoaded() {
    this.setProperties({
      selectedSourceConfig: null,
      showingAddNodeForm: true,
    });
  },

  onNodeAdded(nodeConfig) {
    this.sendAction('nodeAdded');
  },

  actions : {
    selectNode(nodeConfig) {
      this.setProperties({
        selectedNodeConfig: nodeConfig,
        selectedSourceConfig: null
      });
    },

    selectSource(sourceConfig) {
      const curr = this.get('selectedSourceConfig');
      const dest = sourceConfig;
      const nodeId = sourceConfig.get('nodeId');
      if ( curr !== dest ) {
        // make sure selectedNodeConfig also set, in case of direct URL handling
        sourceConfig.get('profile.nodes').then(nodeConfigs => {
          const nodeConfig = nodeConfigs.findBy('nodeId', nodeId);
          this.setProperties({
            selectedNodeConfig: nodeConfig,
            selectedSourceConfig: sourceConfig,
            showingAddNodeForm: false,
          });
          this.sendAction('selectedSource', sourceConfig);
        });
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
        this.setProperties({
          selectedSourceConfig: null,
          showingAddNodeForm: true,
        });
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
