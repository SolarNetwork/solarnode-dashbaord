import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'fieldset',
  canRemove: false,

  store: Ember.inject.service(),

  inserted: Ember.on('didInsertElement', function() {
    var container = this.$().find('input[type=color]').spectrum({
      preferredFormat: 'hex',
      showInput: true,
      chooseText: this.get('i18n').t('action.choose')
    });
  }),

  actions : {
    togglePropertyVisibility(prop) {
      prop.toggleProperty('isHidden');
    },

    removeProperty(prop) {
      const sourceConfig = this.get('sourceConfig');
      prop.destroyRecord();
      sourceConfig.save();
    },

    addNewProperty() {
      const sourceConfig = this.get('sourceConfig');
      var propConfig = this.get('store').createRecord('chart-property-config');
      sourceConfig.get('props').then(props => {
        props.pushObject(propConfig);
        propConfig.save();
        sourceConfig.save();
      });
    },
  },

});
