import Ember from 'ember';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Ember.Route.extend(UnauthenticatedRouteMixin, {

    queryParams: {
        nodeId: {
            refreshModel: true
        }
    },
  
    beforeModel(params) {
        if ( params && params.queryParams && params.queryParams.nodeId ) {
            // always allow going to this route if a nodeId param provided
        } else {
            // otherwise let UnauthenticatedRouteMixin handle normally
            this._super(...arguments);
        }
    },

    model(params) {
        var m = this._super(...arguments);
        if ( m === undefined ) {
            m = {};
        }
        if ( params && params.nodeId ) {
            m.nodeId = params.nodeId;
        }
        return m;
    }

  });
  
