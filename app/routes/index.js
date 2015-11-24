import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  userService: Ember.inject.service(),

  model() {
    return this.get('userService.activeUserProfile');
  },

  afterModel(model) {
    if ( !(model && model.get('isSetup') ) ) {
      this.transitionTo('get-started');
    } else {
      this.transitionTo('home');
    }
  }
});
