import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');
  this.route('auth-error');
  this.route('pick-sources');
  this.route('get-started');
  this.route('home', { path: '/home' }, function() {
    this.route('chart', { path: '/:chartId', resetNamespace: true });
  });
  this.route('data-props', function() {
    this.route('source', { path: '/:id' });
  });
});

export default Router;
