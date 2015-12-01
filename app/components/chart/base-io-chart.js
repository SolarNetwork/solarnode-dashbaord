import Ember from 'ember';
import BaseChart, { ConfigurationAccessor } from './base-chart';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';
import colorbrewer from 'npm:colorbrewer';
import { reverseColorGroupColors, bestColorSetFromColorGroup } from '../../services/chart-helper';

export { ConfigurationAccessor } from './base-chart';

export default BaseChart.extend({
  negativeGroupIds: ['Consumption'],

  /**
   An array of Colorbrewer style color groups to use for data-based color maps.
   This is not used when a <code>chartConfig</code> is set.
   */
  dataColorGroups: [reverseColorGroupColors(colorbrewer.Blues), reverseColorGroupColors(colorbrewer.Greens)],

  /**
   Get a default color map to use when only data is provided (no chart config).
   */
  dataColorMap: Ember.computed('negativeGroupIds', 'data', 'dataColorGroups', function() {
    const dataGroups = this.get('data');
    const colorGroups = this.get('dataColorGroups');
    const result = {};
    if ( dataGroups && colorGroups ) {
      dataGroups.forEach((dataGroup, groupIndex) => {
        const groupColors = {groupId: dataGroup.groupId, sourceColors:{}};
        const colorGroup = (colorGroups && groupIndex < colorGroups.length ? colorGroups[groupIndex] : undefined);
        if ( colorGroup ) {
          const colorSet = bestColorSetFromColorGroup(dataGroup.sourceIds.length, colorGroup);
          dataGroup.sourceIds.forEach(function(sourceId, sourceIndex) {
            groupColors.sourceColors[sourceId] = colorSet[index];
          });
        }
        result[dataGroup.groupId] = groupColors;
      });
    }
    return result;
  }),

  computeChartGroupSettings: Ember.on('init', Ember.observer('chartConfig', function() {
    const chartConfig = this.get('chartConfig');
    if ( !chartConfig ) {
      return;
    }
    chartConfig.get('sourceGroups').then(sourceGroups => {
      const negativeGroupIds = [];
      const groupSourecProperties = [];
      const colorMap = {};
      sourceGroups.forEach(sourceGroup => {
        const groupId = sourceGroup.get('id');
        const sourceGroupFlags = sourceGroup.get('flags');
        if ( !(sourceGroupFlags && sourceGroupFlags.generation) ) {
          negativeGroupIds.push(groupId);
        }
        colorMap[groupId] = {groupId: groupId, sourceColors:{}};
        groupSourecProperties.push(sourceGroup.get('sourceProperties').then(sProps => {
          sProps.forEach(sProp => {
            colorMap[groupId].sourceColors[sProp.source] = sProp.color;
          });
        }));
      });
      Ember.RSVP.all(groupSourecProperties).then(() => {
        this.setProperties({negativeGroupIds: negativeGroupIds, colorMap: colorMap});
      });
    });
  })),

  colorMap: Ember.computed.reads('dataColorMap'),

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
