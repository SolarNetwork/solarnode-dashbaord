import Ember from 'ember';
import BaseChart, { datumChartPropsForExport } from './base-chart';
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
        .colors(['#f7c819']);
      this.set('snChart', chart);
      this.computeChartColors();
      this.computePropVisibilityMap();
    }
    return chart;
  }),

  computeChartColors() {
    const propConfigs = this.get('propConfigs');
    if ( !propConfigs ) {
      return;
    }
    const colors = [];
    propConfigs.forEach(propConfig => {
      colors.push(propConfig.get('color'));
    });
    this.set('colors', colors);
  },

  colorPropertiesChanged: Ember.observer('propConfigs.@each.color', function() {
    this.computeChartColors();
  }),

  propVisibilityChanged: Ember.observer('propConfigs.@each.isHidden', function() {
    this.computePropVisibilityMap();
  }),

  computePropVisibilityMap() {
    const propConfigs = this.get('propConfigs');
    if ( !propConfigs ) {
      return;
    }
    const vizMap = {};
    propConfigs.forEach(propConfig => {
      const sourceId = propConfig.get('source');
      const prop = propConfig.get('prop');
      const lineId = lineIdForProperty(sourceId, prop);
      vizMap[lineId] = propConfig.get('isHidden');
    });
    this.set('visibilityMap', vizMap);
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
      if ( Array.isArray(data) && data.length > 0 && Array.isArray(data[0].data) && Array.isArray(data[0].sourceIds) ) {
        data.forEach(function(groupData) {
          // line chart does not do groups... just load data for each configured property
          var dataBySource = d3.nest()
            .key(function(d) { return d.sourceId; })
            .sortKeys(d3.ascending)
            .entries(groupData.data);
          dataBySource.forEach(function(sourceData) {
            const sourceId = sourceData.key;
            const data = sourceData.values;
            const propConfigsForSource = chartConfig.get('properties').filterBy('source', sourceId);
            propConfigsForSource.forEach(function(propConfig) {
              chart.load(data, lineIdForProperty(sourceId, propConfig.get('prop')), propConfig.get('prop'));
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
    get() {
      const chart = this.get('snChart');
      return (chart ? chart.colors() : undefined);
    },
    set(key, value) {
      const chart = this.get('snChart');
      if ( chart && Array.isArray(value) ) {
        chart.colors(value);
        this.regenerateChart();
      }
      return (chart ? chart.colors() : undefined);
    }
  }),

	/* === CSV Export Support === */

	chartGenerateCSV(chart) {
		const records = [];
		const header = [];
		var propKeys;
		records.push(header);
    header.push('Date' +(chart.aggregate ? ' (' +chart.aggregate() +')' : ''));
    header.push('Source');
    chart.enumerateDataOverTime(function timeIterator(data, date) {
      var keys = Object.keys(data).sort();
      var localDate;
      keys.forEach(function sourceIterator(sourceId) {
        var d = data[sourceId],
          row;
        if ( localDate === undefined ) {
          localDate = d.localDate + ' ' + d.localTime;
        }
        row = [localDate, sourceId];
        if ( !propKeys ) {
          propKeys = datumChartPropsForExport(d).filter(function(propKey) {
            // also exclude sourceId
            return (propKey !== 'sourceId');
          });
          propKeys.forEach(function(propKey) {
            header.push(propKey);
          });
        }
        propKeys.forEach(function(propKey) {
          row.push(d[propKey]);
        });
        records.push(row);
      });
    });
		return d3.csv.format(records);
	},

  exportChartData() {
    const snChart = this.get('snChart');
    this.chartExportDataCSV();
  },

});
