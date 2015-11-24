import Ember from 'ember';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

export default Ember.Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height'],
  classNames: ['app-chart', 'app-chart-stream'/*, 'uk-responsive-width'*/],
  chartHelper: Ember.inject.service(),
  aggregate: 'Hour',
  data: undefined, // array of data to load
  chartConfig: undefined, // a ChartConfig object
  prop: 'watts',

  // chart: should be implemented in extending classes

  chartConfigurationChanged: Ember.observer('chart', 'data', function() {
    Ember.run.once(this, 'draw');
  }),

  chartConfigChanged: Ember.observer('chartConfig', function() {
    this.loadDataFromChartConfig();
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
    const data = this.get('data');
    const chart = this.get('chart');
    const prop = this.get('prop');
    if ( data && chart ) {
      chart.reset();
      if ( Array.isArray(data) && data.length > 0 && data[0].data && data[0].source ) {
        data.forEach(function(groupData) {
          chart.load(groupData.data, groupData.source.get('source'), groupData.source.get('props.firstObject'));
        });
      } else if ( Array.isArray(data) ) {
        chart.load(data, prop, prop);
      }
      chart.regenerate();
    }
  },

  didInsertElement() {
    if ( this.get('chartConfig') ) {
      this.loadDataFromChartConfig();
    } else {
      this.draw();
    }
  }

});
