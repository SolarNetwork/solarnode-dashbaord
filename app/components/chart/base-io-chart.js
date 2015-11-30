import Ember from 'ember';
import BaseChart, { reverseColors, ConfigurationAccessor } from './base-chart';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';
import colorbrewer from 'npm:colorbrewer';

export { reverseColors, ConfigurationAccessor } from './base-chart';

export default BaseChart.extend({
  negativeGroupIds: ['Consumption'],
  colorGroups: {'Consumption' : reverseColors(colorbrewer.Blues), 'Generation': reverseColors(colorbrewer.Greens)},

  computeChartGroupSettings: Ember.on('init', Ember.observer('chartConfig', function() {
    const chartConfig = this.get('chartConfig');
    if ( !chartConfig ) {
      return;
    }
    chartConfig.get('sourceGroups').then(sourceGroups => {
      const colorGroups = {};
      const negativeGroupIds = [];
      sourceGroups.forEach(sourceGroup => {
        const groupId = sourceGroup.get('id');
        const sourceGroupFlags = sourceGroup.get('flags');
        if ( !(sourceGroupFlags && sourceGroupFlags.generation) ) {
          negativeGroupIds.push(groupId);
          colorGroups[groupId] = reverseColors(colorbrewer.Blues);
        } else {
          colorGroups[groupId] = reverseColors(colorbrewer.Greens);
        }
      });
      this.setProperties({negativeGroupIds: negativeGroupIds, colorGroups: colorGroups});
    });
  })),

  colorMap: Ember.computed('data', 'colorGroups', function() {
    const dataGroups = this.get('data');
    const colorGroups = this.get('colorGroups');
    const result = {};
    if ( dataGroups && colorGroups ) {
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
          dataGroup.sourceIds.forEach(function(sourceId, index) {
            groupColors.sourceColors[sourceId] = colorSet[index];
          });
        }
        result[dataGroup.groupId] = groupColors;
      });
    }
    return result;
  }),

  colorMapChanged: Ember.observer('colorMap', function() {
    const chart = this.get('chart');
    const colorMap = this.get('colorMap');
    chart.colorCallback((groupId, sourceId) => {
      return (colorMap[groupId] ? colorMap[groupId].sourceColors[sourceId] : null);
    });
  }),

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
  },

});
