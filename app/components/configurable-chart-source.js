import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'fieldset',
  canRemove: false,

  store: Ember.inject.service(),

  source: Ember.computed.alias('sourceConfig.source'),
  sourceProperties: Ember.computed('propConfigs.@each.source', 'source', function() {
    const sourceId = this.get('source');
    return this.get('propConfigs').filterBy('source', sourceId);
  }),

  allSourceProperties: Ember.computed('allPropConfigs.@each.source', 'source', function() {
    const sourceId = this.get('source');
    return this.get('allPropConfigs').filterBy('source', sourceId);
  }),

  availableSourceProperties: Ember.computed.setDiff('allSourceProperties', 'sourceProperties'),

  hasAvailableSourceProperties: Ember.computed.notEmpty('availableSourceProperties'),

  inserted: Ember.on('didInsertElement', function() {
    var container = this.$().find('input[type=color]').spectrum({
      preferredFormat: 'hex',
      showInput: true,
      chooseText: this.get('i18n').t('action.choose')
    });
  }),

  hasSelectedNewPropertyId: Ember.computed.notEmpty('selectedNewPropertyId'),

  canAddNewProperty: Ember.computed.and('hasAvailableSourceProperties', 'hasSelectedNewPropertyId'),

  canRemoveProperty: Ember.computed.gt('sourceProperties.length', 1),

  actions : {
    togglePropertyVisibility(prop) {
      this.sendAction('togglePropertyVisibility', prop);
      //prop.toggleProperty('isHidden');
    },

   setPropertyColor(prop, color) {
      this.sendAction('setPropertyColor', prop, color);
   },

    selectNewProperty(propConfigId) {
      this.set('selectedNewPropertyId', propConfigId);
    },

    showAddNewPropertyForm() {
      this.set('isShowAddPropertyForm', true);
    },

    hideAddNewPropertyForm() {
      this.set('isShowAddPropertyForm', false);
    },

    removeProperty(prop) {
      this.sendAction('removeProperty', prop.get('id'));
    },

    addNewProperty() {
      const newPropId = this.get('selectedNewPropertyId');
      if ( newPropId ) {
        this.sendAction('addNewProperty', newPropId);
      }
    },
  },

});
