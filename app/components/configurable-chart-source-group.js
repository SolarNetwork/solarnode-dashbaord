import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'fieldset',
  classNameBindings: ['notFirst:uk-margin-top'],
  groupIndex: 0,
  notFirst: Ember.computed('groupIndex', function() {
    return (this.get('groupIndex') > 0);
  }),
  sourceGroup: null,
  isFixedGroupCount: true,
  fixedGroupCount: 2,

  /**
    Filters all prop configs to just those for the assigned node ID.
   */
  groupProps: Ember.computed('allPropConfigs.[]', 'sourceGroup.nodeId', function() {
    const nodeId = this.get('sourceGroup.nodeId');
    return this.get('allPropConfigs').filterBy('nodeId', nodeId).mapBy('prop');
  }),
  uniqueGroupProps: Ember.computed.uniq('groupProps'),
  availableGroupProps: Ember.computed.sort('uniqueGroupProps', function(l, r) {
      return (l < r ? -1 : l > r ? 1 : 0);
  }),

  /**
   Filters the available source configs to just those with available property configs with a sourceGroup.groupProp property.
   */
  availableGroupSourceConfigs: Ember.computed('availableSourceConfigs.[]', 'availablePropConfigs.[]', 'sourceGroup.nodeId', 'sourceGroup.groupProp', function() {
    const nodeId = this.get('sourceGroup.nodeId');
    const groupProp = this.get('sourceGroup.groupProp');
    const sourceConfigs = this.get('availableSourceConfigs');
    var filteredPropConfigs = this.get('availablePropConfigs');
    if ( !(nodeId && sourceConfigs && filteredPropConfigs) ) {
      return null;
    }
    filteredPropConfigs = filteredPropConfigs.filter(function(propConfig) {
      return (nodeId === propConfig.get('nodeId') && groupProp === propConfig.get('prop'));
    });
    const availableSourceIds = filteredPropConfigs.mapBy('source');
    return sourceConfigs.filter(function(sourceConfig) {
      return (nodeId === sourceConfig.get('nodeId') && availableSourceIds.contains(sourceConfig.get('source')));
    });
  }),

  hasAvailableGroupSourceConfigs: Ember.computed.notEmpty('availableGroupSourceConfigs'),

  availableGroupPropConfigs: Ember.computed('availableGroupSourceConfigs.[]', 'availablePropConfigs.[]', 'sourceGroup.nodeId', 'sourceGroup.groupProp', function() {
    const nodeId = this.get('sourceGroup.nodeId');
    const groupProp = this.get('sourceGroup.groupProp');
    const sourceConfigs = this.get('availableGroupSourceConfigs');
    const propConfigs = this.get('availablePropConfigs');
    if ( !(nodeId && groupProp && sourceConfigs) ) {
      return null;
    }
    const availableSourceIds = sourceConfigs.mapBy('source');
    return propConfigs.filter(function(propConfig) {
      return (nodeId === propConfig.get('nodeId') && availableSourceIds.contains(propConfig.get('source')));
    });
  }),

  hasAvailableGroupPropConfigs: Ember.computed.notEmpty('availableGroupPropConfigs'),

  actions : {
    togglePropertyVisibility(prop) {
      this.sendAction('togglePropertyVisibility', prop);
    },

    setPropertyColor(prop, color) {
      this.sendAction('setPropertyColor', prop, color);
    },

    removeProperty(propConfigId) {
      const groupConfigId = this.get('sourceGroup.id');
      this.sendAction('removeGroupedProperty', groupConfigId, propConfigId);
    },

    addNewSourceProperty(propConfigId) {
      const groupConfigId = this.get('sourceGroup.id');
      this.sendAction('addNewGroupedSourceProperty', groupConfigId, propConfigId);
      this.set('selectedNewSourcePropertyId', null);
      if ( !this.get('hasAvailablePropConfigs') ) {
        this.send('hideAddSourceConfigForm');
        this.set('selectedNewSourceId', null);
      }
    },

    selectGroupNodeId(newNodeId) {
      const oldNodeId = this.get('sourceGroup.nodeId');
      newNodeId = +newNodeId; // turn into number
      if ( oldNodeId === newNodeId ) {
        return;
      }
      const removedSourceIds = this.get('sourceGroup.sourceIds');

      this.get('sourceGroup').setProperties({
        'nodeId': newNodeId,
        'sourceIds': [],
      });

      // remove all existing prop configs; get IDs so not mutating array while iterating over it
      const removedPropConfigIds = this.get('propConfigs').filter(function(propConfig) {
        return (oldNodeId === propConfig.get('nodeId') && removedSourceIds.contains(propConfig.get('source')));
      }).mapBy('id');
      removedPropConfigIds.forEach(propConfigId => {
        this.send('removeProperty', propConfigId);
      });
    },

    selectGroupProp(prop) {
      const currValue = this.get('sourceGroup.groupProp');
      if ( currValue === prop ) {
        return;
      }

      const nodeId = this.get('sourceGroup.nodeId');
      const removedSourceIds = this.get('sourceGroup.sourceIds');

      this.get('sourceGroup').setProperties({
        'groupProp': prop,
        'sourceIds': [],
      });

      // remove all existing prop configs, and try to switch them to the new group prop
      const removedPropConfigIds = this.get('propConfigs').filter(function(propConfig) {
        return (nodeId === propConfig.get('nodeId') && removedSourceIds.contains(propConfig.get('source')));
      }).mapBy('id');
      removedPropConfigIds.forEach(propConfigId => {
        this.send('removeProperty', propConfigId);
      });
      const filteredPropConfigIds = this.get('availablePropConfigs').filter(propConfig => {
        return (propConfig.get('prop') === prop && removedSourceIds.contains(propConfig.get('source')) && propConfig.get('nodeId') === nodeId);
      }).mapBy('id');
      filteredPropConfigIds.forEach(propConfigId => {
        this.send('addNewSourceProperty', propConfigId);
      });
    },
  },

});
