import Ember from 'ember';
import d3 from 'npm:d3';

var dateFormat = d3.time.format("%d.%m.%Y");
var datePropertyAccessor = {
    get(key) {
      var val = this.get(key);
      return (val ? dateFormat(val) : null);
    },
    set(key, value) {
      var val = (value ? dateFormat.parse(value) : null);
      this.set(key, val);
      return (val ? value : null);
    }
};

export default Ember.Component.extend({
  store: Ember.inject.service(),
  userService: Ember.inject.service(),

  dateStart: Ember.computed('startDate', datePropertyAccessor),
  dateEnd: Ember.computed('endDate', datePropertyAccessor),

  period: 1,
  periodType: 'day',
  isUsePeriod: true,

  periodTypes: ['hour', 'day', 'month', 'year'],
  periodChoices: Ember.computed('period', 'periodTypes', function() {
    const i18n = this.get('i18n');
    const count = this.get('period');
    return this.get('periodTypes').map(type => {
      return {key:type, label:i18n.t('chart.period.'+type, {count:count}).toString().capitalize()};
    });
  }),

  aggregate: null,
  aggregateTypes: ['FiveMinute', 'Hour', 'Day', 'Month', 'Year'],
  aggregateChoices: Ember.computed('aggregate', 'aggregateTypes', function() {
    const i18n = this.get('i18n');
    return this.get('aggregateTypes').map(type => {
      return {key:type, label:i18n.t('chart.aggregate.'+type).toString().capitalize()};
    });
  }),

	actions: {
    toggleUsePeriod() {
      this.toggleProperty('isUsePeriod');
    },

	  selectChartSuggestion(suggestion) {
      const store  = this.get('store');
	    const profile = this.get('userProfile');
	    const nodeId = profile.get('user.nodeId');
      const sampleConfiguration = suggestion.get('sampleConfiguration');
      Ember.RSVP.all([profile.get('charts'), profile.get('chartSources'), profile.get('chartProperties')])
      .then(([chartConfigs, sourceConfigs, propConfigs]) => {
        var chartConfig = store.createRecord('chart-config', {
          profile: profile,
          type: suggestion.get('type'),
          subtype: suggestion.get('subtype'),
          style: (suggestion.get('style') ? suggestion.get('style') : 'line'),
          flags: suggestion.get('flags'),
          isSettingsVisible: true,
          title: suggestion.get('title')
        });
        if ( suggestion.sourceGroups ) {
          suggestion.sourceGroups.forEach(function(group) {
            var sourceGroup = store.createRecord('chart-source-group', {
              chart: chartConfig,
              title : group.groupId,
              flags: group.flags,
              groupProp: group.prop,
              nodeId: nodeId,
              sourceIds: group.sourceIds,
            });
            group.sourceIds.forEach(function(sourceId, index) {
              // sourceConfig may already exist here
              if ( !sourceConfigs.findBy('source', sourceId) ) {
                var sourceConfig = store.createRecord('chart-source-config', {
                  profile: profile,
                  nodeId: nodeId,
                  source : sourceId
                });
                sourceConfig.save();
              }
              // propertyConfig may already exist here
              var propConfig = propConfigs.find(propConfig => {
                return (propConfig.get('source') === sourceId && propConfig.get('prop') === group.prop);
              });
              if ( !propConfig ) {
                 propConfig = store.createRecord('chart-property-config', {
                  profile: profile,
                  nodeId: nodeId,
                  source: sourceId,
                  prop: group.prop
                });
                if ( group.colors && index < group.colors.length ) {
                  propConfig.set('color', group.colors[index]);
                }
              }
              chartConfig.get('properties').pushObject(propConfig);
              propConfig.save();
            });
            sourceGroup.save();
          });
        } else {
          // ungrouped
          // sourceConfig may already exist here
          if ( !sourceConfigs.findBy('source', sampleConfiguration.source) ) {
            var sourceConfig = store.createRecord('chart-source-config', {
              profile: profile,
              nodeId: nodeId,
              source : sampleConfiguration.source
            });
            sourceConfig.save();
          }
          // propertyConfig may already exist here
          var propConfig = propConfigs.find(propConfig => {
            return (propConfig.get('source') === sampleConfiguration.source && propConfig.get('prop') === sampleConfiguration.prop);
          });
          if ( !propConfig ) {
             propConfig = store.createRecord('chart-property-config', {
              profile: profile,
              nodeId: nodeId,
              source: sampleConfiguration.source,
              prop: sampleConfiguration.prop
            });
          }
          chartConfig.get('properties').pushObject(propConfig);
          propConfig.save();
        }
        chartConfig.save();
        //chartConfig.pushObject(chartConfig);
        profile.save();
      });
	  },

	  unselectChartSuggestion(suggestion, charts) {
	    const profile = this.get('userProfile');
	    if ( !charts ) {
	      return;
	    }
	    // also remove groups associated with chart
	    charts.forEach(chart => {
	      chart.get('groups').then(sourceGroups => {
	        sourceGroups.forEach(sourceGroup => {
            sourceGroup.destroyRecord();
	        });
	      });
	      chart.get('properties').then(propConfigs => {
	        propConfigs.forEach(propConfig => {
	          propConfig.get('charts').then(charts => {
	            charts.removeObject(chart);
	            propConfig.save();
	          });
	        });
	      });
	      chart.destroyRecord();
	    });
	    profile.save();
	  }
	}
});
