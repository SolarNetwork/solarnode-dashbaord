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
   Filters the available source configs to just those with available property configs with a sourceGroup.groupProp property.
   */
  availableGroupSourceConfigs: Ember.computed('availableSourceConfigs.[]', 'availablePropConfigs.[]', 'sourceGroup.groupProp', function() {
    const groupProp = this.get('sourceGroup.groupProp');
    const sourceConfigs = this.get('availableSourceConfigs');
    var filteredPropConfigs = this.get('availablePropConfigs');
    if ( !(sourceConfigs && filteredPropConfigs) ) {
      return null;
    }
    filteredPropConfigs = filteredPropConfigs.filterBy('prop', groupProp);
    const availableSourceIds = filteredPropConfigs.mapBy('source');
    return sourceConfigs.filter(function(sourceConfig) {
      return availableSourceIds.contains(sourceConfig.get('source'));
    });
  }),

  hasAvailableGroupSourceConfigs: Ember.computed.notEmpty('availableGroupSourceConfigs'),

  availableGroupPropConfigs: Ember.computed('availableGroupSourceConfigs.[]', 'availablePropConfigs.[]', 'sourceGroup.groupProp', function() {
    const groupProp = this.get('sourceGroup.groupProp');
    const sourceConfigs = this.get('availableGroupSourceConfigs');
    const propConfigs = this.get('availablePropConfigs');
    if ( !(groupProp && sourceConfigs) ) {
      return null;
    }
    const availableSourceIds = sourceConfigs.mapBy('source');
    return propConfigs.filter(function(propConfig) {
      return availableSourceIds.contains(propConfig.get('source'));
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

    selectGroupNode(nodeConfigId) {
      // TODO
    },

    selectGroupProp(prop) {
      const currValue = this.get('sourceGroup.groupProp');
      if ( currValue === prop ) {
        return;
      }
      this.set('sourceGroup.groupProp', prop);

      // remove all existing prop configs, and try to switch them to the new group prop
      const removedSourceIds = this.get('sourceGroup.sourceIds');
      const removedPropConfigIds = [];
      const propConfigs = this.get('propConfigs');
      propConfigs.forEach(propConfig => {
        if ( removedSourceIds.contains(propConfig.get('source')) ) {
          removedPropConfigIds.push(propConfig.get('id'));
        }
      });
      removedPropConfigIds.forEach(propConfigId => {
        this.send('removeProperty', propConfigId);
      });
      const filteredPropConfigIds = this.get('availablePropConfigs').filter(propConfig => {
        return (propConfig.get('prop') === prop && removedSourceIds.contains(propConfig.get('source')));
      }).mapBy('id');
      filteredPropConfigIds.forEach(propConfigId => {
        this.send('addNewSourceProperty', propConfigId);
      });
    },
  },

});
