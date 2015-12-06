import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  chartHelper: Ember.inject.service(),
  userService: Ember.inject.service(),

  model() {
    return Ember.RSVP.hash({
      suggestions: this.get('chartHelper').makeChartSuggestions(),
      userProfile: this.get('userService.activeUserProfile')
    });
  },

  actions: {
    done() {
      this.get('userService.activeUserProfile').then((profile) => {
        profile.set('isSetup', true);
        profile.save();
        this.eventBus.publish('UserProfile.SetupComplete', true);
        this.transitionTo('home');
      });
    }
  }

});
