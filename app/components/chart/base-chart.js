import Ember from 'ember';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

export const ConfigurationAccessor = {
  get(key) {
    const chartConfiguration = this.get('chartConfiguration');
    return chartConfiguration.value(key);
  },
  set(key, value) {
    const chartConfiguration = this.get('chartConfiguration');
    chartConfiguration.value(key, value);
    return value;
  }
};

export function datumChartPropsForExport(d) {
  if ( !d ) {
    return [];
  }
  return Object.keys(d).filter(function(propKey) {
    return (propKey !== 'key'
      && propKey !== 'date'
      && propKey !== 'localDate'
      && propKey !== 'localTime'
      && propKey !== 'y'
      && propKey !== 'y0'
      && !propKey.match(/^_/));
  }).sort()
}

export default Ember.Component.extend({
  tagName: 'svg',
  attributeBindings: ['width', 'height'],
  classNames: ['app-chart', 'app-chart-stream'/*, 'uk-responsive-width'*/],
  chartHelper: Ember.inject.service(),

  aggregate: Ember.computed('chartConfiguration', ConfigurationAccessor),

  data: undefined, // array of data groups to load
  chartConfig: undefined, // a ChartConfig object
  prop: 'watts',

  snConfiguration: null,

  refreshTimer : null,
  refreshInterval : (5*60*1000),

  init() {
    this._super(...arguments);
    this.eventBus.subscribe('ChartConfig.exportDataRequest', this, 'onExportDataRequest');
  },

  destroy() {
    this.eventBus.unsubscribe('ChartConfig.exportDataRequest');
    this._super(...arguments);
  },

  willDestroy: Ember.on('willDestroyElement', function() {
    const refreshTimer = this.get('refreshTimer');
    if ( refreshTimer ) {
      Ember.run.cancel(refreshTimer);
    }
  }),

  inserted: Ember.on('didInsertElement', function() {
    if ( this.get('chartConfig') ) {
      this.loadDataFromChartConfig();
    } else {
      this.shouldDraw();
    }
  }),

  chartConfiguration : Ember.computed(function() {
    var conf = this.get('snConfiguration');
    if ( !conf ) {
      conf = new sn.Configuration({});
      this.set('snConfiguration', conf);
      this.regenerateChartConfiguration(); // get initial configuration values
    }
    return conf;
  }),

  // chart: should be implemented in extending classes

  chartConfigurationChanged: Ember.observer('chart', 'data', function() {
    this.shouldDraw();
  }),

  widthHeightChanged: Ember.observer('width', 'height', function() {
    Ember.run.once(this, 'regenerateChartConfiguration');
  }),

  regenerateChartConfiguration() {
    const chartConfiguration = this.get('chartConfiguration');
    if ( chartConfiguration ) {
      chartConfiguration.value('width', this.get('width'));
      chartConfiguration.value('height', this.get('height'));
      if ( this.get('chartConfig') ) {
        this.regenerateChart();
      }
    }
  },

  chartConfigChanged: Ember.on('init', Ember.observer('chartConfig', 'chartConfig.isUsePeriod', 'chartConfig.period',
      'chartConfig.periodAggregate', 'chartConfig.startDate', 'chartConfig.endDate', 'chartConfig.aggregate',
      'propConfigs.[]', 'chartConfig.groups.@each.groupProp',
      function() {
    Ember.run.once(this, function() {
      const chart = this.get('chart');
      if ( !chart ) {
        return;
      }
      const chartConfig = this.get('chartConfig');
      if ( chartConfig ) {
        const isUsePeriod = chartConfig.get('isUsePeriod');
        var refreshTimer = this.get('refreshTimer');
        if ( isUsePeriod ) {
          this.set('aggregate', chartConfig.get('periodAggregate'));
          if ( !refreshTimer ) {
            refreshTimer = Ember.run.later(this, 'refreshDataFromChartConfig', this.get('refreshInterval'));
            this.set('refreshTimer', refreshTimer);
          }
        } else {
          this.set('aggregate', chartConfig.get('aggregate'));
          if ( refreshTimer ) {
            Ember.run.cancel(refreshTimer);
            this.set('refreshTimer', null);
          }
        }
        this.set('hasDrawn', false);
        this.loadDataFromChartConfigThrottled();
      }
    });
  })),

  refreshDataFromChartConfig() {
    Ember.run.once(this, 'loadDataFromChartConfig');
    this.loadDataFromChartConfig();
    var refreshTimer = Ember.run.later(this, 'refreshDataFromChartConfig', this.get('refreshInterval'));
    this.set('refreshTimer', refreshTimer);
  },

  isLoadingData: false,

  regenerateChart() {
    if ( this.get('hasDrawn') ) {
      Ember.run.once(this, 'internalRegenerateChart');
    }
  },

  internalRegenerateChart() {
    const chart = this.get('chart');
    const chartConfig = this.get('chartConfig');
    if ( chart && (!chartConfig || chartConfig.get('isValid')) && !this.get('isLoadingData') ) {
      chart.regenerate();
    }
  },

  loadDataFromChartConfig() {
    Ember.run.once(this, 'internalLoadDataFromChartConfig');
  },

  loadDataFromChartConfigThrottled() {
    Ember.run.debounce(this, 'internalLoadDataFromChartConfig', 600);
  },

  internalLoadDataFromChartConfig() {
    const chartConfig = this.get('chartConfig');
    const helper = this.get('chartHelper');
    if ( chartConfig && helper && !this.get('isLoadingData') ) {
      this.set('isLoadingData', true);
      helper.dataForChart(chartConfig).then(data => {
        if ( !(this.isDestroyed || this.isDestroying) ) {
          this.regenerateChartConfiguration();
          this.setProperties({ isLoadingData: false, data: data });
        }
      }).catch(reason => {
        this.set('isLoadingData', false);
        console.log('Error loading data: ' + reason);
      });
    }
  },

  hasDrawn : false,

  shouldDraw() {
    this.set('hasDrawn', false);
    Ember.run.once(this, 'draw');
  },

  draw() {
    // extending classes should implement
    console.log(`Drawing chart ${this}`);
    this.set('hasDrawn', true);
  },

  onExportDataRequest(exportChartConfigId) {
    const chartConfigId = this.get('chartConfig.id');
    if ( chartConfigId !== exportChartConfigId ) {
      return;
    }
    console.log('export chart ' +chartConfigId);
    this.exportChartData();
  },

  exportChartData() {
    // extending classes should implement this
    console.warn(`Chart ${this.get('chartConfig.id')} does not implement exportChartData!`);
  },

  chartGenerateCSV() {
    console.warn(`Chart ${this.get('chartConfig.id')} does not implement chartGenerateCSV!`);
  },

	chartExportDataCSV() {
	  const urlHelper = this.get('chartHelper.clientHelper.nodeUrlHelper');
	  const title = this.get('chartConfig.title');
	  const csvContent = this.chartGenerateCSV(this.get('snChart'));
	  if ( !csvContent ) {
	    return;
	  }
		var blob = new Blob([csvContent],{type: 'text/csv;charset=utf-8;'}),
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

});
