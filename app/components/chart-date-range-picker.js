import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'fieldset',
  classNames: ['uk-margin-top'],

  actions : {
    toggleUsePeriod(value) {
      this.sendAction('toggleUsePeriod', value);
    },
  }
});
