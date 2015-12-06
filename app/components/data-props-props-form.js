import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'form',
  classNames: ['uk-form', 'uk-form-stacked'],

  actions : {
    focus(target, ...rest) {
      console.log('focus: ' +target + ', ' + rest);
    },

    blur(target) {
      console.log('blur: ' +target + ', ' + rest);
    },
  },
});
