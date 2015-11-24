import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['uk-grid', 'uk-flex-top', 'app-clickable'],
  attributeBindings: ['gridMargin:data-uk-grid-margin'],
  gridMargin: '',
  position: Ember.computed('index', function() {
    return (this.get('index') + 1);
  }),
  selected: Ember.computed('sourceProperties.[]', 'source', function() {
    var source = this.get('source');
    var sourceProperties = this.get('sourceProperties');
    return sourceProperties.any(function(sourceProperty) {
      return (sourceProperty.source === source.source && sourceProperty.prop === source.prop);
    });
  }),
  click() {
    if ( this.get('selected') ) {
      this.get('onUnselect')(this.get('source'));
    } else {
      this.get('onSelect')(this.get('source'));
    }
  }
});
