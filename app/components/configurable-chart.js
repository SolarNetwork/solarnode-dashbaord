import Ember from 'ember';
import d3 from 'npm:d3';

var dateFormat = d3.time.format("%d.%m.%Y");
var datePropertyAccessor = {
    get(key) {
      var val = this.get('chart.'+key);
      return (val ? dateFormat(val) : null);
    },
    set(key, value) {
      var val = (value ? dateFormat.parse(value) : null);
      this.set('chart.'+key, val);
      return (val ? value : null);
    }
};

export default Ember.Component.extend({
  store: Ember.inject.service(),

  classNames: ['app-configurable-chart'],

  chartName: Ember.computed.alias('chart.title'),
  chartUnit: Ember.computed.alias('chart.unit'),
  chartWidth: 550,
  canSave: Ember.computed('chart.hasDirtyAttributes',
    'chart.groups.@each.{hasDirtyAttributes,isNew}',
    'chart.properties.@each.{hasDirtyAttributes,isNew}',
    function() {
    return (this.get('chart.hasDirtyAttributes')
        || this.get('chart.groups').any(function(obj) { return obj.get('hasDirtyAttributes') || obj.get('isNew'); })
        || this.get('chart.properties').any(function(obj) { return obj.get('hasDirtyAttributes') || obj.get('isNew'); })
        );
  }),
  startDate: Ember.computed('chart.startDate', datePropertyAccessor),
  endDate: Ember.computed('chart.endDate', datePropertyAccessor),
  period: Ember.computed.alias('chart.period'),
  periodType: Ember.computed.alias('chart.periodType'),
  isUsePeriod: Ember.computed.alias('chart.isUsePeriod'),
  isSettingsVisible: Ember.computed.alias('chart.isSettingsVisible'),

  periodTypes: ['hour', 'day', 'month', 'year'],
  periodChoices: Ember.computed('period', 'periodTypes', function() {
    const i18n = this.get('i18n');
    const count = this.get('period');
    return this.get('periodTypes').map(type => {
      return {key:type, label:i18n.t('chart.period.'+type, {count:count}).toString().capitalize()};
    });
  }),

  aggregate: Ember.computed.alias('chart.aggregate'),
  aggregateTypes: ['FiveMinute', 'Hour', 'Day', 'Month', 'Year'],
  aggregateChoices: Ember.computed('aggregate', 'aggregateTypes', function() {
    const i18n = this.get('i18n');
    return this.get('aggregateTypes').map(type => {
      return {key:type, label:i18n.t('chart.aggregate.'+type).toString().capitalize()};
    });
  }),

  /**
   Flag if the current chart style supports the display of grouped data sets.

   @return {boolean} true if the chart style supports grouped data sets
  */
  canGroupSources: Ember.computed('chart.style', function() {
    const style = this.get('chart.style');
    return (style !== 'line'); // TODO: set this to what styles are explicitly supported
  }),

  uniqueSourceConfigs: Ember.computed('chart.uniqueSources.[]', 'allSourceConfigs.@each.source', function() {
    const sources = this.get('chart.uniqueSources');
    const sourceConfigs = this.get('allSourceConfigs');
    if ( !sourceConfigs ) {
      return Ember.RSVP.resolve(new Ember.A());
    }
    return this.get('allSourceConfigs').filter(sourceConfig => {
      return sources.indexOf(sourceConfig.get('source')) !== -1;
    }).sort((l, r) => {
      const lIndex = sources.indexOf(l.get('source'));
      const rIndex = sources.indexOf(r.get('source'));
      return (lIndex < rIndex ? -1 : lIndex > rIndex ? 1 : 0);
    });
  }),

  inserted: Ember.on('didInsertElement', function() {
    this.get('resizeService').on('debouncedDidResize', this, this.didResize);
    Ember.run.next(this, 'didResize');
  }),

  willDestroy: Ember.on('willDestroyElement', function() {
    this.get('resizeService').off('debouncedDidResize', this, this.didResize);
  }),

  didResize() {
    const w = this.$().find('.app-chart-container').width();
    var width = this.get('w');
    if ( w !== width ) {
      this.set('chartWidth', w);
      console.log(`width: ${window.innerWidth}, height: ${window.innerHeight}, chartWidth: ${w}`);
    }
  },

  actions: {
    toggleUsePeriod() {
      this.toggleProperty('isUsePeriod');
    },

    toggleSettingsVisibility() {
      this.toggleProperty('isSettingsVisible');
      this.get('chart').save();
      Ember.run.next(this, 'didResize');
    },

    togglePropertyVisibility(prop) {
      this.get('chart.properties').then(propConfigs => {
        const propConfig = propConfigs.findBy('id', prop.get('id'));
        if ( propConfig ) {
          propConfig.toggleProperty('isHidden');
        }
      });
    },

    setPropertyColor(prop, color) {
      this.get('chart.properties').then(propConfigs => {
        const propConfig = propConfigs.findBy('id', prop.get('id'));
        if ( propConfig ) {
          propConfig.set('color', color);
        };
      });
    },

    addNewProperty(propConfigId) {
      const chart = this.get('chart');
      this.get('store').findRecord('chart-property-config', propConfigId).then(propConfig => {
        chart.get('properties').then(propConfigs => {
          propConfigs.pushObject(propConfig);
          propConfig.save();
          chart.save();
        });
      });
    },

    removeProperty(propConfigId) {
      const chart = this.get('chart');
      this.get('store').findRecord('chart-property-config', propConfigId).then(propConfig => {
        chart.get('properties').then(propConfigs => {
          propConfigs.removeObject(propConfig);
          propConfig.save();
          chart.save();
        });
      });
    },

    save() {
      const chart = this.get('chart');
      chart.save();
      chart.get('groups').forEach(obj => {
        obj.save();
      });
      chart.get('properties').forEach(obj => {
        obj.save();
      });
    }
  }
});
