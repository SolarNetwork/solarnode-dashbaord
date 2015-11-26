import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  chart: DS.belongsTo('chart-config', {inverse:'sourceGroups'}),
  sources: DS.hasMany('chart-source-config', {inverse:'group'}),

  /**
   Get an array of all configured sources and properties.

   @return {Array} Array of objects like <code>{source:X, prop:Y, metadata:Z}</code>
   */
  sourceProperties: Ember.computed('sources.@each.props', function() {
    // arrays is array of arrays
    var arrays = this.get('sources').map(function(source) {
      var props = source.get('props');
      var meta = source.get('propsMetadata');
      if ( props ) {
        return props.map(function(prop) {
          return {source:source.get('source'), prop:prop, metadata:(meta ? meta[prop] : null)};
        });
      }
      return [];
    });
    // merge array of arrays into single array
    return [].concat.apply([], arrays);
  })

});
