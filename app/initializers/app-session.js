export function initialize(application) {
  // give ever controller a 'session' property
  application.inject('controller', 'session', 'service:session');
  application.inject('route', 'session', 'service:session');
}

export default {
  name: 'session',
  initialize: initialize
};
