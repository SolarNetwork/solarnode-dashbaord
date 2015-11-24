import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ChartGroup from '../models/chart-group';
import SelectableChart from '../models/selectable-chart';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  userService: Ember.inject.service(),

  model() {
    return this.get('userService.activeUserProfile').then(profile => {
      return profile.get('charts');
    }).then(charts => {
      var selectableCharts = charts.map(chart => {
        return SelectableChart.create({
          chart: chart,
          selected: false
        });
      });
      return ChartGroup.create({charts:selectableCharts});
    });
  },

  redirect(model, transition) {
    var targetChartId = (transition && transition.params && transition.params.chart ? transition.params.chart.chartId : undefined);
    var chart;
    if ( targetChartId && model ) {
      chart = model.get('charts').findBy('chart.id', targetChartId);
      if ( chart ) {
        chart.set('selected', true);
      }
      return;
    }
    if ( model ) {
      transition.send('selectChart', model.get('charts.firstObject'));
    }
  },

  actions : {
    selectChart(chart) {
      chart.set('selected', true);
      this.transitionTo('chart', chart);
    }
  }

});
