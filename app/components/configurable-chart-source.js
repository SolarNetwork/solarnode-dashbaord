import Ember from 'ember';

export default Ember.Component.extend({
  canRemove: false,

  inserted: Ember.on('didInsertElement', function() {
    var container = this.$().find('input[type=color]').spectrum({
      preferredFormat: 'hex',
      showInput: true,
      chooseText: this.get('i18n').t('action.choose')
    });
  })

});
