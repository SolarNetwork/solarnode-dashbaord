import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'nav',
  classNames: ['uk-navbar', 'uk-navbar-attached', 'app-navbar'],

  session: Ember.inject.service(),

  isHome: Ember.computed.equal('routeName', 'home'),

  userService: Ember.inject.service(),

  activeUserProfile: Ember.computed.alias('userService.activeUserProfile'),

  init() {
    this._super(...arguments);
    this.eventBus.subscribe('UserProfile.SetupComplete', this, 'onSetupComplete');
  },

  destroy() {
    this.eventBus.unsubscribe('UserProfile.SetupComplete');
    this._super(...arguments);
  },

  onSetupComplete() {
    this.set('isSetup', true);
  },

  setupChanged: Ember.on('init', Ember.observer('activeUserProfile', 'activeUserProfile.isSetup', function() {
    this.get('activeUserProfile').then(profile => {
      this.set('isSetup', (profile && profile.get('isSetup')));
    });
  })),

  actions: {
    login() {
      this.sendAction('onLogin');
    },

    logout() {
      this.get('session').invalidate();
    }
  }
});
