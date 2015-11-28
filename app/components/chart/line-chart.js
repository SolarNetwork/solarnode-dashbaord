import Ember from 'ember';
import BaseChart from './base-chart';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

export default BaseChart.extend({

  chart: Ember.computed('height', 'width', 'aggregate', function() {
    var chartConfiguration = new sn.Configuration({
      width: this.get('width'),
      height : this.get('height'),
      aggregate : this.get('aggregate')
    });
    var container = this.$().get(0);
    var chart = sn.chart.basicLineChart(container, chartConfiguration)
      .colors(['#f7c819']);
    return chart;
  }),

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

  colors: Ember.computed('chart', {
    get(key) {
      const chart = this.get('chart');
      return (chart ? chart.colors() : undefined);
    },
    set(key, value) {
      const chart = this.get('chart');
      if ( chart && Array.isArray(value) ) {
        chart.colors(value);
      }
      return (chart ? chart.colors() : undefined);
    }
  })

});
