import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  chartHelper: Ember.inject.service(),
  classNames: ['uk-grid', 'uk-flex-top', 'uk-margin-top-remove', 'app-clickable', 'app-padded'],
  classNameBindings: ['selected:app-selected', 'selected:uk-contrast'],
  gridMargin: '',
  position: Ember.computed('index', function() {
    return (this.get('index') + 1);
  }),

  matchingCharts: Ember.computed('charts.[]', 'suggestion', function() {
    const suggestion = this.get('suggestion');
    const promise = Ember.RSVP.filter(this.get('charts').map(function(chart) {
      return chart.matchesSuggestion(suggestion).then(function(isMatch) {
        return (isMatch ? chart : null);
      });
    }), function(v) {
      return (v !== null);
    });
    return DS.PromiseArray.create({promise:promise});
  }),

  selected: Ember.computed('matchingCharts.[]', 'suggestion', function() {
    const suggestion = this.get('suggestion');
    const matchingCharts = this.get('matchingCharts');
    return (matchingCharts.get('length') > 0);
  }),

  click() {
    if ( this.get('selected') ) {
      this.get('onUnselect')(this.get('suggestion'), this.get('matchingCharts'));
    } else {
      this.get('onSelect')(this.get('suggestion'));
    }
  }
});
