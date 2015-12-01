import Ember from 'ember';

export default Ember.Component.extend(Ember.TextSupport, {
  tagName: 'input',
  attributeBindings: ['value', 'type'],
  type: 'color',
  value: '#f7c819',

  color: Ember.computed.alias('value'),

  change(event) {
    const color = event.target.value;
    this.set('color', color);
    this.get('onChangeColor')(color);
  },

  inserted: Ember.on('didInsertElement', function() {
    var container = this.$().spectrum({
      preferredFormat: 'hex',
      showInput: true,
      showInitial: true,
      showButtons: true,
      clickoutFiresChange: false,
      cancelText: this.get('i18n').t('action.cancel'),
      chooseText: this.get('i18n').t('action.choose')
    });
  })
});
