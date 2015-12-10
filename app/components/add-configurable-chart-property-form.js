import Ember from 'ember';
import { sortByNodeIdThenSource } from '../models/chart-config';

export default Ember.Component.extend({

  /**
   Set to a specific property to only allow picking a specific property value.
   */
  fixedProp: null,

  availableNewSourceProperties: Ember.computed('selectedNewSourceId', 'availablePropConfigs.[]', 'fixedProp', function() {
    const propConfigs = this.get('availablePropConfigs');
    const sourceConfigId = this.get('selectedNewSourceId');
    const fixedProp = this.get('fixedProp');
    const sourceConfig = this.get('availableSourceConfigs').findBy('id', sourceConfigId);
    if ( !(propConfigs && sourceConfig) ) {
      return new Ember.A();
    }
    var filteredPropConfigs = propConfigs.filter(function(propConfig) {
      return (sourceConfig.get('source') === propConfig.get('source') && sourceConfig.get('nodeId') === propConfig.get('nodeId'));
    });
    if ( fixedProp ) {
      filteredPropConfigs = filteredPropConfigs.filterBy('prop', fixedProp);
    }
    return filteredPropConfigs.sort(sortByNodeIdThenSource);
  }),

  hasSelectedNewSourceId: Ember.computed.notEmpty('selectedNewSourceId'),

  hasSelectedNewSourcePropertyId: Ember.computed.notEmpty('selectedNewSourcePropertyId'),

  canAddNewSourceProperty: Ember.computed.and('hasAvailableSourceConfigs', 'hasSelectedNewSourceId', 'hasSelectedNewSourcePropertyId'),

  actions: {

    showAddSourceConfigForm() {
      this.set('isShowAddSourceConfigForm', true);
    },

    hideAddSourceConfigForm() {
      this.set('isShowAddSourceConfigForm', false);
    },

    selectNewSource(sourceConfigId) {
      this.set('selectedNewSourceId', sourceConfigId);

      // if we are fixed on a prop, then auto-select that now
      const fixedProp = this.get('fixedProp');
      if ( fixedProp ) {
        const firstPropConfig = this.get('availableNewSourceProperties.firstObject');
        if ( firstPropConfig ) {
          this.send('selectNewSourceProperty', firstPropConfig.get('id'));
        }
      }
    },

    selectNewSourceProperty(propConfigId) {
      this.set('selectedNewSourcePropertyId', propConfigId);
    },

    addNewSourceProperty() {
      const propConfigId = this.get('selectedNewSourcePropertyId');
      this.sendAction('addNewSourceProperty', propConfigId);
      this.set('selectedNewSourcePropertyId', null);
      if ( !this.get('hasAvailablePropConfigs') ) {
        this.send('hideAddSourceConfigForm');
        this.set('selectedNewSourceId', null);
      }
    },

  },
});
