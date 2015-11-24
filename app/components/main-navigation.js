import Ember from 'ember';

const { service } = Ember.inject;

export default Ember.Component.extend({
  tagName: 'nav',
  classNames: ['uk-navbar', 'uk-navbar-attached', 'app-navbar'],

  session:        service('session'),

  isHome: Ember.computed.equal('routeName', 'home'),

  actions: {
    login() {
      this.sendAction('onLogin');
    },

    logout() {
      this.get('session').invalidate();
    }
  }
});
