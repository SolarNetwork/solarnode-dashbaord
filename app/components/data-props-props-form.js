import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'form',
  classNames: ['uk-form', 'uk-form-stacked'],

  propConfigsSorting: ['prop'],
  sortedPropConfigs: Ember.computed.sort('propConfigs', 'propConfigsSorting'),

  actions : {

   setPropertyColor(prop, color) {
      this.sendAction('setPropertyColor', prop, color);
   },

  },
});
