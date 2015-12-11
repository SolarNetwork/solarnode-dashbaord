import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'fieldset',

  actions : {
    toggleUsePeriod(value) {
      this.sendAction('toggleUsePeriod', value);
    },
  }
});
