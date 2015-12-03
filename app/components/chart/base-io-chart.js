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
            groupColors.sourceColors[sourceId] = colorSet[sourceIndex];
          });
        }
        result[dataGroup.groupId] = groupColors;
      });
    }
    return result;
  }),

  computeChartConfigColorMap() {
    this.get('chartConfig.propertyConfigs').then(propertyConfigs => {
      const colorMap = {};
      propertyConfigs.forEach(propertyConfig => {
        const groupId = propertyConfig.get('source.group.id');
        const sourceId = propertyConfig.get('source.source');
        if ( !colorMap[groupId] ) {
          colorMap[groupId] = {groupId: groupId, sourceColors: {}};
        }
        colorMap[groupId].sourceColors[sourceId] = propertyConfig.get('color');
      });
      this.set('colorMap', colorMap);
    });
  },

  computeChartGroupSettings: Ember.on('init', Ember.observer('chartConfig', function() {
    const chartConfig = this.get('chartConfig');
    if ( !chartConfig ) {
      return;
    }
    chartConfig.get('sourceGroups').then(sourceGroups => {
      const negativeGroupIds = [];
      sourceGroups.forEach(sourceGroup => {
        const groupId = sourceGroup.get('id');
        const sourceGroupFlags = sourceGroup.get('flags');
        if ( !(sourceGroupFlags && sourceGroupFlags.generation) ) {
          negativeGroupIds.push(groupId);
        }
      });
      this.set('negativeGroupIds', negativeGroupIds);
      this.computeChartConfigColorMap();
      this.computePropVisibilityMap();
    });
  })),

  colorMap: Ember.computed.reads('dataColorMap'),

  colorPropertiesChanged: Ember.observer('chartConfig.propertyConfigs.@each.color',
    'chartConfig.propertyConfigs.@each.sourceId', function() {
    this.computeChartConfigColorMap();
  }),

  colorMapChanged: Ember.observer('snChart', 'colorMap', function() {
    const chart = this.get('snChart');
    if ( !chart ) {
      return;
    }
    const colorMap = this.get('colorMap');
    chart.colorCallback((groupId, sourceId) => {
      return (colorMap[groupId] ? colorMap[groupId].sourceColors[sourceId] : null);
    });
    this.regenerateChart();
  }),

  propVisibilityChanged: Ember.observer('chartConfig.propertyConfigs.@each.isHidden', function() {
    this.computePropVisibilityMap();
  }),

  computePropVisibilityMap() {
    this.get('chartConfig.propertyConfigs').then(propertyConfigs => {
      const vizMap = {};
      propertyConfigs.forEach(propertyConfig => {
        const groupId = propertyConfig.get('source.group.id');
        const sourceId = propertyConfig.get('source.source');
        if ( !vizMap[groupId] ) {
          vizMap[groupId] = {groupId: groupId, sourceVisibility: {}};
        }
        vizMap[groupId].sourceVisibility[sourceId] = propertyConfig.get('isHidden');
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
    chart.sourceExcludeCallback((groupId, sourceId) => {
      return (vizMap[groupId] ? vizMap[groupId].sourceVisibility[sourceId] : false);
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
