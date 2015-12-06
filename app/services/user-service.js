import Ember from 'ember';

const { isEmpty } = Ember;

export default Ember.Service.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),

  activeUser: Ember.computed('session.data.authenticated.userId', function() {
    const userId = this.get('session.data.authenticated.userId');
    const store = this.get('store');
    if ( store && !isEmpty(userId) ) {
      return store.find('user', userId);
    }
    return Ember.RSVP.resolve(undefined);
  }),

  activeUserProfile: Ember.computed('activeUser', function() {
    return this.get('activeUser').then(user => {
      if ( !user ) {
        return undefined;
      }
      return user.get('profile');
    });
  })

});
