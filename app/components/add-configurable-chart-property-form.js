import Ember from 'ember';

export default Ember.Component.extend({

  /**
   Set to a specific property to only allow picking a specific property value.
   */
  fixedProp: null,

  availableNewSourceProperties: Ember.computed('selectedNewSourceId', 'availablePropConfigs.[]', 'fixedProp', function() {
    const propConfigs = this.get('availablePropConfigs');
    const sourceId = this.get('selectedNewSourceId');
    const fixedProp = this.get('fixedProp');
    if ( !(propConfigs && sourceId) ) {
      return new Ember.A();
    }
    var filteredPropConfigs = propConfigs.filterBy('source', sourceId);
    if ( fixedProp ) {
      filteredPropConfigs = filteredPropConfigs.filterBy('prop', fixedProp);
    }
    return filteredPropConfigs.sort((l, r) => {
      const lS = l.get('source');
      const rS = r.get('source');
      return (lS < rS ? -1 : lS > rS ? 1 : 0);
    });
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

    selectNewSource(sourceId) {
      this.set('selectedNewSourceId', sourceId);
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
