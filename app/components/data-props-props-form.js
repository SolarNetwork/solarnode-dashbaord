import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'form',
  classNames: ['uk-form', 'uk-form-stacked'],

  propConfigsSorting: ['prop'],
  sortedPropConfigs: Ember.computed.sort('propConfigs', 'propConfigsSorting'),

  actions : {
    focus(target) {
      console.log('focus: ' +target);
    },

    blur(target) {
      console.log('blur: ' +target);
    },
  },
});
