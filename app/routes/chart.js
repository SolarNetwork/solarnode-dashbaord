import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import SelectableChart from '../models/selectable-chart';

export default Ember.Route.extend(AuthenticatedRouteMixin, {

  model(params) {
    // note we don't do this in afterModel because we only want it invoked via direct URL, e.g. browser back button
    return this.store.findRecord('chart-config', params.chartId).then(chart => {
      this.eventBus.publish('chartRoute.ChartLoaded', chart);
      return SelectableChart.create({
        chart: chart,
        selected: true
      });
    });
  }

});
