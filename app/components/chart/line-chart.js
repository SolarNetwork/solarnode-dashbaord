import Ember from 'ember';
import BaseChart from './base-chart';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

function lineIdForProperty(sourceId, prop) {
  return sourceId + '-' + prop;
}

export default BaseChart.extend({

  chart: Ember.computed(function() {
    const chartConfiguration = this.get('chartConfiguration');
    var container = this.$().get(0);
    var chart = this.get('snChart');
    if ( !chart ) {
      chart = sn.chart.basicLineChart(container, chartConfiguration)
        .colors(['#f7c819'])
      this.set('snChart', chart);
    }
    return chart;
  }),

  computeChartColors() {
    const chartConfig = this.get('chartConfig');
    if ( !chartConfig ) {
      return;
    }
    chartConfig.get('propertyConfigs').then(propertyConfigs => {
      const colors = [];
      propertyConfigs.forEach(propertyConfig => {
        colors.push(propertyConfig.get('color'));
      });
      this.set('colors', colors);
    });
  },

  colorPropertiesChanged: Ember.on('init', Ember.observer('chartConfig.propertyConfigs.@each.color', function() {
    this.computeChartColors();
  })),

  propVisibilityChanged: Ember.observer('chartConfig.propertyConfigs.@each.isHidden', function() {
    this.computePropVisibilityMap();
  }),

  computePropVisibilityMap() {
    this.get('chartConfig.propertyConfigs').then(propertyConfigs => {
      const vizMap = {};
      propertyConfigs.forEach(propertyConfig => {
        const sourceId = propertyConfig.get('source.source');
        const prop = propertyConfig.get('prop');
        const lineId = lineIdForProperty(sourceId, prop);
        vizMap[lineId] = propertyConfig.get('isHidden');
      });
      this.set('visibilityMap', vizMap);
    });
  },

  visibilityMapChanged: Ember.observer('snChart', 'visibilityMap', function() {
    const chart = this.get('snChart');
    const vizMap = this.get('visibilityMap');
    if ( !(chart && vizMap) ) {
      return;
    }
    chart.sourceExcludeCallback(lineId => {
      return vizMap[lineId];
    });
    this.regenerateChart();
  }),

  draw() {
    this._super(...arguments);
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
              chart.load(groupData.data, lineIdForProperty(sourceId, prop.prop), prop.prop);
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
        this.regenerateChart();
      }
      return (chart ? chart.colors() : undefined);
    }
  })

});
