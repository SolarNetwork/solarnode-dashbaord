import Ember from 'ember';
import d3 from 'npm:d3';

var dateFormat = d3.time.format("%d.%m.%Y");

export default Ember.Component.extend({
  store: Ember.inject.service(),
  userService: Ember.inject.service(),

  dateStart: Ember.computed('startDate', function() {
    const val = this.get('startDate');
    return (val ? dateFormat.parse(val) : null);
  }),

  dateEnd: Ember.computed('endDate', function() {
    const val = this.get('endDate');
    return (val ? dateFormat.parse(val) : null);
  }),

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
  periodAggregate: Ember.computed('periodType', function() {
    const periodType = this.get('periodType');
    if ( periodType === 'year' ) {
      return 'Month';
    } else if ( periodType === 'day' ) {
      return 'Hour';
    } else if ( periodType === 'hour' ) {
      return 'FiveMinute';
    } else {
      // default to Day
      return 'Day';
    }
  }),

  aggregate: 'Day',
  aggregateTypes: ['FiveMinute', 'Hour', 'Day', 'Month', 'Year'],
  aggregateChoices: Ember.computed('aggregate', 'aggregateTypes', function() {
    const i18n = this.get('i18n');
    return this.get('aggregateTypes').map(type => {
      return {key:type, label:i18n.t('chart.aggregate.'+type).toString().capitalize()};
    });
  }),

  suggestionParams: Ember.computed('period', 'periodType', 'periodAggregate', 'isUsePeriod', 'aggregate', 'dateStart', 'dateEnd', function() {
    const params = Ember.Object.create({
      period: this.get('period'),
      periodType: this.get('periodType'),
      periodAggregate: this.get('periodAggregate'),
      isUsePeriod: this.get('isUsePeriod'),
      aggregate: this.get('aggregate'),
      startDate: this.get('dateStart'),
      endDate: this.get('dateEnd'),
    });
    return params;
  }),

  dateRangeChanged: Ember.observer('period', 'periodType', 'periodAggregate', 'isUsePeriod', 'aggregate', 'dateStart', 'dateEnd', function() {
    const params = this.get('suggestionParams');
    if ( !params.get('isUsePeriod') && !(params.get('startDate') && params.get('endDate')) ) {
      return;
    }
    this.sendAction('updateSuggesionsDateRange', params);
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
