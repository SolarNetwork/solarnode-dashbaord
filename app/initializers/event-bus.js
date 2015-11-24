export function initialize(application) {
  application.inject('route', 'eventBus', 'service:event-bus');
  application.inject('component', 'eventBus', 'service:event-bus');
}

export default {
  name: 'event-bus',
  initialize: initialize
};
