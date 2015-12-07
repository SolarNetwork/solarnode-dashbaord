import Ember from 'ember';

export default Ember.Component.extend(Ember.TextSupport, {
  tagName: 'input',
  attributeBindings: ['value', 'type'],
  type: 'color',
  value: '#f7c819',

  /**
   A context object to pass as the first argument to the configured <code>onChangeColor</code> action.
   */
  colorContext: null,

  color: Ember.computed.alias('value'),

  change(event) {
    const color = event.target.value;
    this.set('color', color);
    this.get('onChangeColor')(this.get('colorContext'), color);
  },

  inserted: Ember.on('didInsertElement', function() {
    this.$().spectrum({
      preferredFormat: 'hex',
      showInput: true,
      showInitial: true,
      showButtons: true,
      clickoutFiresChange: false,
      cancelText: this.get('i18n').t('action.cancel'),
      chooseText: this.get('i18n').t('action.choose')
    });
  }),

  destroy() {
    this.$().spectrum('destroy');
    this._super.apply(this, arguments);
  },

});
