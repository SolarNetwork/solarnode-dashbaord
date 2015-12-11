import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';
import DataSourceConfig from '../models/data-source-config';
import { datumNumericPropertyKeys } from '../services/chart-helper';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  clientHelper:  Ember.inject.service(),
  userService: Ember.inject.service(),

  nodeConfig: Ember.computed.alias('userService.activeNodeConfig'),

  model() {
    const getSources = Ember.RSVP.denodeify(sn.api.node.availableSources);
    const store = this.get('store');
    return Ember.RSVP.all([this.get('nodeConfig'), this.get('userService.activeUserProfile')])
    .then(([nodeConfig, profile]) => {
      return profile.get('nodes').then(allNodeConfigs => {
        return Ember.RSVP.hash({
          profile: profile,
          activeNodeConfig: nodeConfig,
          allNodeConfigs: allNodeConfigs,
          allSourceConfigs: profile.get('chartSources'),
          allPropConfigs: profile.get('chartProperties'),
        }).then(model => {
          allNodeConfigs.forEach(nodeConfig => {
            const nodeId = nodeConfig.get('nodeId');
            const urlHelper = nodeConfig.get('urlHelper');
            const jsonClient = nodeConfig.get('jsonClient');
            const nodeClient = nodeConfig.get('nodeClient');
            getSources(urlHelper, jsonClient).then(sourceIds => {
            var added = false;
            sourceIds.forEach(sourceId => {
              const matchingSourceConfig = model.allSourceConfigs.find(sourceConfig => {
                return (sourceConfig.get('nodeId') === nodeId && sourceId === sourceConfig.get('source'));
              });
              if ( !matchingSourceConfig ) {
                // create one now!
                var sourceConfig = store.createRecord('chart-source-config', {
                  profile: profile,
                  nodeId: nodeId,
                  source: sourceId,
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
                    return (propConfig.get('nodeId') === nodeId && propConfig.get('source') === sourceId && propConfig.get('prop') === prop);
                  });
                  if ( !matchingPropConfig ) {
                    var propConfig = store.createRecord('chart-property-config', {
                      profile: profile,
                      nodeId: nodeId,
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
          });
          return model;
        });
      });
    });
  },

  actions : {
    selectedSource(sourceConfig) {
      const nodeId = sourceConfig.get('nodeId');
      sourceConfig.get('profile').then(profile => {
        return Ember.RSVP.all([profile.get('nodes').findBy('nodeId', nodeId), profile.get('chartProperties')])
        .then(([nodeConfig, allPropConfigs]) => {
          const model = DataSourceConfig.create({
            profile: profile,
            nodeConfig: nodeConfig,
            sourceConfig: sourceConfig,
            allPropConfigs: allPropConfigs.filterBy('nodeId', nodeId),
          });
          this.transitionTo('data-props.source', model);
        });
      });
    },

    showAddNewNodeForm() {
      this.transitionTo('data-props.add-node');
    },

    nodeAdded() {
      this.model().then(model => {
        this.transitionTo('data-props');
      });
    },
  },

});
