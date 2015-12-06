import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Controller.extend({

  application: Ember.inject.controller('application'),

  isLogin: Ember.computed.equal('application.currentRouteName', 'login'),

  routeName: Ember.computed.readOnly('application.currentRouteName'),

  actions: {
    transitionToLoginRoute() {
      this.transitionToRoute('login');
    }
  }
});
