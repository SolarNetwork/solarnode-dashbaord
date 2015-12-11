import Ember from 'ember';

export default Ember.Route.extend({

  redirect(model, transition) {
    var showing = (transition && transition.params && transition.params['data-props.add-node']
      ? true : false);
    if ( showing ) {
      Ember.run.next(() => {
        this.eventBus.publish('data-props.addNode.AddNodeFormLoaded');
      });
    }
  },

});
