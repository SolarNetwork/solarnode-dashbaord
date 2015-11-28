import Ember from 'ember';
import BaseChart from './base-chart';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';
import colorbrewer from 'npm:colorbrewer';

function reverseColors(colorGroup) {
  const result = {};
  Object.keys(colorGroup).forEach(function(key) {
    var copy = colorGroup[key].slice();
    copy.reverse();
    result[key] = copy;
  });
  return result;
}

export default BaseChart.extend({
  negativeGroupIds: ['Consumption'],
  colorGroups: {'Consumption' : reverseColors(colorbrewer.Blues), 'Generation': reverseColors(colorbrewer.Greens)},

  isNorthernHemisphere: false,
  isShowSumLine: true,

  colorMap: Ember.computed('data', 'colorGroups', function() {
    const dataGroups = this.get('data');
    const colorGroups = this.get('colorGroups');
    const result = {};
    if ( dataGroups ) {
      dataGroups.forEach(dataGroup => {
        const groupColors = {groupId: dataGroup.groupId, sourceColors:{}};
        const colorGroup = colorGroups[dataGroup.groupId];
        if ( colorGroup ) {
          const numSources = (Array.isArray(dataGroup.sourceIds) && dataGroup.sourceIds.length > 3 ? dataGroup.sourceIds.length : 3);
          // find the closest number of color groups, so colors as far apart as possible
          var colorKey = numSources;
          while ( colorKey > 3 && !colorGroup[colorKey] ) {
            colorKey -= 1;
          }
          const colorSet = colorGroup[colorKey];
          dataGroup.sources.forEach(function(sourceId, index) {
            groupColors.sourceColors[sourceId] = colorSet[index];
          });
        }
        result[dataGroup.groupId] = groupColors;
      });
    }
    return result;
  }),

  chart: Ember.computed('height', 'width', 'aggregate', 'negativeGroupIds', 'colorMap', function() {
    var chartConfiguration = new sn.Configuration({
      width: this.get('width'),
      height : this.get('height'),
      aggregate : this.get('aggregate'),
      plotProperties : {Hour : 'wattHours', Day : 'wattHours', Month : 'wattHours'}
    });
    const container = this.$().get(0);
    const colorMap = this.get('colorMap');
	  var chart = sn.chart.energyIOBarChart(container, chartConfiguration)
	    .negativeGroupIds(this.get('negativeGroupIds'))
	    .showSumLine(this.get('isShowSumLine'))
	    .northernHemisphere(this.get('isNorthernHemisphere'))
      .colorCallback((groupId, sourceId) => {
        var color = (colorMap[groupId] ? colorMap[groupId].sourceColors[sourceId] : null);
        return color;
      });
    return chart;
  }),

  colorForGroupSource(groupId, sourceId) {
    var colorMap = this.get('colorMap');
    var color = (colorMap[groupId] ? colorMap[groupId][sourceId] : null);
    return color;
  },

  draw() {
    const chartConfig = this.get('chartConfig');
    const data = this.get('data');
    const chart = this.get('chart');
    const prop = this.get('prop');
    var scale = 1;
    if ( data && chart ) {
      chart.reset();
      data.forEach(function(groupData) {
        chart.load(groupData.data, groupData.groupId);
      });
      chart.regenerate();
      scale = (chart.yScale ? chart.yScale() : chart.scale());
      if ( chartConfig ) {
        chartConfig.set('displayScale', scale);
      }
    }
  }

});
