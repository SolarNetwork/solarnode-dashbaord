import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),

	actions: {
	  selectChartSuggestion(suggestion) {
      const store  = this.get('store');
	    const profile = this.get('userProfile');
      const sampleConfiguration = suggestion.get('sampleConfiguration');
      profile.get('charts').then(function(charts) {
        var chartConfig = store.createRecord('chart-config', {
          type: suggestion.get('type'),
          subtype: suggestion.get('subtype'),
          style: (suggestion.get('style') ? suggestion.get('style') : 'line'),
          flags: suggestion.get('flags'),
          isSettingsVisible: true,
          profile: profile,
          title: suggestion.get('title')
        });
        if ( suggestion.sourceGroups ) {
          suggestion.sourceGroups.forEach(function(group) {
            var sourceGroup = store.createRecord('chart-source-group', {
              chart: chartConfig,
              title : group.groupId,
              flags: group.flags
            });
            group.sourceIds.forEach(function(sourceId, index) {
              var sourceConfig = store.createRecord('chart-source-config', {
                group: sourceGroup,
                source : sourceId
              });
              var propConfig = store.createRecord('chart-property-config', {
                prop: group.prop
              });
              if ( group.colors && index < group.colors.length ) {
                propConfig.set('color', group.colors[index]);
              }
              sourceConfig.get('props').pushObject(propConfig);
              propConfig.save();
              sourceConfig.save();
            });
            sourceGroup.save();
          });
        } else {
          // single source group
          var sourceGroup = store.createRecord('chart-source-group', {
            chart: chartConfig,
            title : sampleConfiguration.source
          });
          var sourceConfig = store.createRecord('chart-source-config', {
            group: sourceGroup,
            source : sampleConfiguration.source,
          });
          var propConfig = store.createRecord('chart-property-config', {
            prop: sampleConfiguration.prop
          });
          sourceConfig.get('props').pushObject(propConfig);
          propConfig.save();
          sourceConfig.save();
          sourceGroup.save();
        }
        chartConfig.save();
        charts.pushObject(chartConfig);
        profile.save();
      });
	  },

	  unselectChartSuggestion(suggestion, charts) {
	    const profile = this.get('userProfile');
	    if ( !charts ) {
	      return;
	    }
	    // note we are cleaning up all child relationship records to conserve space in local storage
	    charts.forEach(chart => {
	      chart.get('sourceGroups').then(sourceGroups => {
	        sourceGroups.forEach(sourceGroup => {
            sourceGroup.get('sources').then(sourceConfigs => {
              sourceConfigs.forEach(sourceConfig => {
                sourceConfig.get('props').then(props => {
                  props.forEach(prop => {
                    prop.destroyRecord();
                  });
                });
                sourceConfig.destroyRecord();
              });
            });
            sourceGroup.destroyRecord();
	        });
	      });
	      chart.destroyRecord();
	    });
	    profile.save();
	  }
	}
});
