import Ember from 'ember';

export default Ember.Component.extend({
  chartHelper: Ember.inject.service(),
  classNames: ['uk-grid', 'uk-flex-top', 'uk-margin-top-remove', 'app-clickable', 'app-padded'],
  classNameBindings: ['selected:app-selected', 'selected:uk-contrast'],
  gridMargin: '',
  position: Ember.computed('index', function() {
    return (this.get('index') + 1);
  }),
  selected: Ember.computed('chartSourceProperties.[]', 'suggestion', function() {
    var sampleConfiguration = this.get('suggestion.sampleConfiguration');
    var chartSourceProperties = this.get('chartSourceProperties');
    return chartSourceProperties.any(function(sourceProperty) {
      return (sourceProperty.source === sampleConfiguration.source && sourceProperty.prop === sampleConfiguration.prop);
    });
  }),
  click() {
    if ( this.get('selected') ) {
      this.get('onUnselect')(this.get('suggestion'));
    } else {
      this.get('onSelect')(this.get('suggestion'));
    }
  }
});
