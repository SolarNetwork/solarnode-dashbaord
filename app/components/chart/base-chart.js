import Ember from 'ember';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

export default Ember.Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height'],
  classNames: ['app-chart', 'app-chart-stream'/*, 'uk-responsive-width'*/],
  chartHelper: Ember.inject.service(),
  aggregate: 'Hour',
  data: undefined, // array of data groups to load
  chartConfig: undefined, // a ChartConfig object
  prop: 'watts',

  // chart: should be implemented in extending classes

  chartConfigurationChanged: Ember.observer('chart', 'data', function() {
    Ember.run.once(this, 'draw');
  }),

  chartConfigChanged: Ember.observer('chartConfig', 'chartConfig.isUsePeriod', 'chartConfig.period',
      'chartConfig.periodType', 'chartConfig.startDate', 'chartConfig.endDate', 'chartConfig.aggregate', function() {
    Ember.run.once(this, 'loadDataFromChartConfig');
  }),

  inserted: Ember.on('didInsertElement', function() {
    if ( this.get('chartConfig') ) {
      this.loadDataFromChartConfig();
    } else {
      this.draw();
    }
  }),

  loadDataFromChartConfig() {
    const chartConfig = this.get('chartConfig');
    const helper = this.get('chartHelper');
    if ( chartConfig && helper ) {
      helper.dataForChart(chartConfig).then(data => {
        this.set('data', data);
      });
    }
  },

  draw() {
    const chartConfig = this.get('chartConfig');
    const data = this.get('data');
    const chart = this.get('chart');
    const prop = this.get('prop');
    var scale = 1;
    if ( data && chart ) {
      chart.reset();
      if ( Array.isArray(data) && data.length > 0 && data[0].data && data[0].groupId ) {
        data.forEach(function(groupData) {
          // line chart does not do groups... just load data for each configured property
          groupData.group.get('sources').forEach(function(sourceConfig) {
            const sourceId = sourceConfig.get('source');
            sourceConfig.get('properties').forEach(function(prop) {
              chart.load(groupData.data, sourceId, prop.prop);
            });
          });
        });
      } else if ( Array.isArray(data) ) {
        chart.load(data, prop, prop);
      }
      chart.regenerate();
      scale = (chart.yScale ? chart.yScale() : chart.scale());
      if ( chartConfig ) {
        chartConfig.set('displayScale', scale);
      }
    }
  },

});
