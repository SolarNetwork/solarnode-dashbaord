import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';
import DataSourceConfig from '../models/data-source-config';
import { datumNumericPropertyKeys } from '../services/chart-helper';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  clientHelper:  Ember.inject.service(),
  userService: Ember.inject.service(),

  model() {
    const urlHelper = this.get('clientHelper.nodeUrlHelper');
    const getSources = Ember.RSVP.denodeify(sn.api.node.availableSources);
    const nodeClient = this.get('clientHelper.nodeClient');
    const store = this.get('store');
    return this.get('userService.activeUserProfile').then(profile => {
      return Ember.RSVP.hash({
        profile: profile,
        allSourceConfigs: profile.get('chartSources'),
        allPropConfigs: profile.get('chartProperties'),
      }).then(model => {
        getSources(urlHelper).then(sourceIds => {
          var added = false;
          sourceIds.forEach(sourceId => {
            const matchingSourceConfig = model.allSourceConfigs.findBy('source', sourceId);
            if ( !matchingSourceConfig ) {
              // create one now!
              var sourceConfig = store.createRecord('chart-source-config', {
                profile: profile,
                source : sourceId,
              });
              model.allSourceConfigs.pushObject(sourceConfig);
              sourceConfig.save();
              added = true;
            }
          });
          if ( added ) {
            profile.save();
          }
          added = false;
          nodeClient.json(urlHelper.mostRecentURL(sourceIds)).then(data => {
            if ( !Array.isArray(data.results) ) {
              return;
            }
            data.results.forEach(datum => {
              const sourceId = datum.sourceId;
              const propKeys = datumNumericPropertyKeys(datum);
              propKeys.forEach(prop => {
                const matchingPropConfig = model.allPropConfigs.find(function(propConfig) {
                  return (propConfig.get('source') === sourceId && propConfig.get('prop') === prop);
                });
                if ( !matchingPropConfig ) {
                  var propConfig = store.createRecord('chart-property-config', {
                    profile: profile,
                    source: sourceId,
                    prop: prop,
                  });
                  model.allPropConfigs.pushObject(propConfig);
                  propConfig.save();
                  added = true;
                }
              });
            });
            if ( added ) {
              profile.save();
            }
          });
        });
        return model;
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
        });
      });
    },

    showAddNewNodeForm() {
      this.transitionTo('data-props.add-node');
    },

  },

});
