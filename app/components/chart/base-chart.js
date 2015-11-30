import Ember from 'ember';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

const ConfigurationAccessor = {
  get(key) {
    const chartConfiguration = this.get('chartConfiguration');
    return chartConfiguration.value(key);
  },
  set(key, value) {
    const chartConfiguration = this.get('chartConfiguration');
    return chartConfiguration.value(key, value);
  }
};

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

  chartConfiguration : Ember.computed(function() {
    var conf = this.get('snConfiguration');
    if ( !conf ) {
      conf = new sn.Configuration({
        width: this.get('width'),
        height: this.get('height')
      });
      this.set('snConfiguration', conf);
    }
    return conf;
  }),

  // chart: should be implemented in extending classes

  chartConfigurationChanged: Ember.observer('chart', 'data', function() {
    Ember.run.once(this, 'draw');
  }),

  widthHeightChanged: Ember.observer('width', 'height', function() {
    Ember.run.once(this, function() {
      const chartConfiguration = this.get('chartConfiguration');
      chartConfiguration.value('width', this.get('width'));
      chartConfiguration.value('height', this.get('height'));
    });
  }),

  chartConfigChanged: Ember.on('init', Ember.observer('chartConfig', 'chartConfig.isUsePeriod', 'chartConfig.period',
      'chartConfig.periodAggregate', 'chartConfig.startDate', 'chartConfig.endDate', 'chartConfig.aggregate', function() {
    Ember.run.once(this, function() {
      const chart = this.get('chart');
      const chartConfig = this.get('chartConfig');
      if ( chartConfig ) {
        if ( chartConfig.get('isUsePeriod') ) {
          this.set('aggregate', chartConfig.get('periodAggregate'));
        } else {
          this.set('aggregate', chartConfig.get('aggregate'));
        }
        const chartConfiguration = this.get('chartConfiguration');
        this.loadDataFromChartConfig();
      }
    });
  })),

  inserted: Ember.on('didInsertElement', function() {
    if ( this.get('chartConfig') ) {
      this.loadDataFromChartConfig();
    } else {
      this.draw();
    }
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
    // extending classes should implement
  }

});
