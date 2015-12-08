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

  forEachGroupedProperty(callback) {
    return Ember.RSVP.all([this.get('propConfigs'), this.get('chartConfig.groups')]).then(([propConfigs, sourceGroups]) => {
      sourceGroups.forEach(sourceGroup => {
        const groupId = sourceGroup.get('id');
        sourceGroup.get('sourceIds').forEach(sourceId => {
          const propConfig = propConfigs.findBy('source', sourceId);
          if ( propConfig ) {
            callback.apply(this, [groupId, sourceId, propConfig]);
          }
        });
      });
      return sourceGroups;
    });
  },

  computeChartGroupSettings: Ember.on('init', Ember.observer('chartConfig', function() {
    const chartConfig = this.get('chartConfig');
    if ( !chartConfig ) {
      return;
    }
    chartConfig.get('groups').then(sourceGroups => {
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

  colorPropertiesChanged: Ember.observer('propConfigs.@each.color', function() {
    this.computeChartConfigColorMap();
  }),

  computeChartConfigColorMap() {
    const colorMap = {};
    this.forEachGroupedProperty(function(groupId, sourceId, propConfig) {
      if ( !colorMap[groupId] ) {
        colorMap[groupId] = {groupId: groupId, sourceColors: {}};
      }
      colorMap[groupId].sourceColors[sourceId] = propConfig.get('color');
    }).then(() => {
      this.set('colorMap', colorMap);
    });
  },

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

  propVisibilityChanged: Ember.observer('propConfigs.@each.isHidden', function() {
    this.computePropVisibilityMap();
  }),

  computePropVisibilityMap() {
    const vizMap = {};
    this.forEachGroupedProperty(function(groupId, sourceId, propConfig) {
      if ( !vizMap[groupId] ) {
        vizMap[groupId] = {groupId: groupId, sourceVisibility: {}};
      }
      vizMap[groupId].sourceVisibility[sourceId] = propConfig.get('isHidden');
    }).then(() => {
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
    //const prop = this.get('prop');
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

	/* === CSV Export Support === */

	chartGenerateCSV(chart) {
		var records = [];
		var header = ['Date (' + chart.aggregate() +')', 'Source'];
		var propKeys;
		records.push(header);
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
				  propKeys = Object.keys(d).filter(function(propKey) {
				    return (propKey !== 'sourceId'
				      && propKey !== 'date'
				      && propKey !== 'localDate'
				      && propKey !== 'localTime'
				      && propKey !== 'y'
				      && propKey !== 'y0'
				      && !propKey.match(/^_/));
				  }).sort();
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

	chartExportDataCSV() {
	  const urlHelper = this.get('chartHelper.clientHelper.nodeUrlHelper');
	  const title = this.get('chartConfig.title');
		var csvContent = this.chartGenerateCSV(this.get('snChart')),
			blob = new Blob([csvContent],{type: 'text/csv;charset=utf-8;'}),
			url = URL.createObjectURL(blob),
			fileName = 'data-export-' +urlHelper.nodeId +'-' +(title.replace(/\W/g, '-')) +'.csv',
			link;

		if ( navigator && navigator.msSaveBlob ) {
			navigator.msSaveBlob(blob, fileName);
		} else {
			link = document.createElement('a');
			link.setAttribute('href', url);
			if ( link.download !== undefined ) {
				link.setAttribute('download', fileName);
			} else {
				link.setAttribute('target', '_blank');
			}
			link.setAttribute('style', 'visibility: hidden;');

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
    }
	},

  exportChartData() {
    const snChart = this.get('snChart');
    if ( snChart.enumerateDataOverTime ) {
      this.chartExportDataCSV();
    }
  },

});
