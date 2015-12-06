import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';
import DataSourceConfig from '../models/data-source-config';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  clientHelper:  Ember.inject.service(),
  userService: Ember.inject.service(),

  model() {
    const urlHelper = this.get('clientHelper.nodeUrlHelper');
    const getSources = Ember.RSVP.denodeify(sn.api.node.availableSources);
    const store = this.get('store');
    return this.get('userService.activeUserProfile').then(profile => {
      const allSources = profile.get('chartSources').then(sourceConfigs => {
        return getSources(urlHelper).then(sourceIds => {
          var added = false;
          sourceIds.forEach(sourceId => {
            const matchingSourceConfig = sourceConfigs.findBy('source', sourceId);
            if ( !matchingSourceConfig ) {
              // create one now!
              var sourceConfig = store.createRecord('chart-source-config', {
                profile: profile,
                source : sourceId
              });
              sourceConfigs.pushObject(sourceConfig);
              sourceConfig.save();
              added = true;
            }
          });
          if ( added ) {
            profile.save();
          }
          return sourceConfigs;
        });
      });
      return Ember.RSVP.hash({
        profile: profile,
        allSourceConfigs: allSources,
        allPropConfigs: profile.get('chartProperties'),
      });
    });
  },

  actions : {
    selectedSource(sourceConfig) {
      sourceConfig.get('profile').then(profile => {
        profile.get('chartProperties').then(allPropConfigs => {
          const model = DataSourceConfig.create({
            profile: profile,
            sourceConfig: sourceConfig,
            allPropConfigs: allPropConfigs,
          });
          this.transitionTo('data-props.source', model);
        })
      });
    }
  },

});
