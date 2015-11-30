import Ember from 'ember';

/**
 A suggestion for a style of chart.
 */
export default Ember.Object.extend({
  title: '',
  type: 'General',
  subtype: 'General',
  flags: null,
  metadata: null,
  sourceGroups: null,
  sources: null,
  data: null,
  sampleConfiguration: null,

  /**
   Get an array of source properties used in this suggestion, in the form of
   <code>{source:X prop:Y}</code>.

   @return {Array} - An array of source property objects.
   */
  sourceProperties: Ember.computed('sourceGroups', 'sampleConfiguration', function() {
    var sampleConf = this.get('sampleConfiguration');
    var sourceGroups = this.get('sourceGroups');
    var sourceProperties = [];
    if ( Array.isArray(sourceGroups) && sourceGroups.length > 0 ) {
      // generate the array of configurations
      sourceGroups.forEach(function(sourceGroup) {
        if ( Array.isArray(sourceGroup.sourceIds) ) {
          sourceGroup.sourceIds.forEach(function(sourceId) {
            sourceProperties.push({source:sourceId, prop:sourceGroup.prop});
          });
        }
      });
    } else if ( sampleConf ) {
      // for non-grouped charts, push the single configuration we already have
      sourceProperties.push(sampleConf);
    }
    return sourceProperties;
  })

});
