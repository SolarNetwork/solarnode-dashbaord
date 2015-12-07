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

  inserted: Ember.on('didInsertElement', function() {
    var container = this.$().find('input[type=color]').spectrum({
      preferredFormat: 'hex',
      showInput: true,
      chooseText: this.get('i18n').t('action.choose')
    });
  }),

  canAddNewProperty: Ember.computed.notEmpty('selectedNewPropertyId'),

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

    removeProperty(prop) {
      return;// TODO
      const sourceConfig = this.get('sourceConfig');
      prop.destroyRecord();
      sourceConfig.save();
    },

    addNewProperty() {
      const newPropId = this.get('selectedNewPropertyId');
      if ( newPropId ) {
        this.sendAction('addNewProperty', newPropId);
      }
    },
  },

});
