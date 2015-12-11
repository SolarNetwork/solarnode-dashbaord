import Ember from 'ember';
const { isEmpty } = Ember;

export default Ember.Component.extend({
  hasMessage: Ember.computed('infoMessage', 'errorMessage', function() {
    return (this.get('infoMessage') || this.get('errorMessage'));
  }),
  actions: {

    onSubmit() {
      this.sendAction('onSubmit', this.getProperties('identification', 'token', 'secret'));
    }

  }
});
