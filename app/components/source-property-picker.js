import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),

	actions: {
	  selectSource(source) {
	    const profile = this.get('userProfile');
      const store  = this.get('store');
      function addSourceProperty(sourceProfiles) {
        // add this property to proper SourceProfile, creating one if does not already exist
        var sourceProfile = (sourceProfiles ? sourceProfiles.findBy('source', source.source) : undefined);
        if ( !sourceProfile ) {
          sourceProfile = store.createRecord('source-profile', {
            profile : profile,
            source : source.source
          });
          profile.get('sources').pushObject(sourceProfile);
          profile.save();
        }
        var props = sourceProfile.get('props');
        if ( !props ) {
          props = [];
        }
        if ( !props.any(function(prop) { return (prop === source.prop); }) ) {
          // copy the array, as we depend on computed observation of this property
          props = props.slice();
          props.push(source.prop);
          sourceProfile.set('props', props);
          sourceProfile.save();
        }
      }

      var sources = profile.get('sources');
      if ( sources ) {
        sources.then(addSourceProperty, function() {
          // ignoring reason, just assume no sources exist
          addSourceProperty();
        });
      } else {
        addSourceProperty();
      }
	  },

	  unselectSource(source) {
	    const profile = this.get('userProfile');
	    const sources = profile.get('sources');
	    if ( sources ) {
	      sources.then(function(sourceProfiles) {
	        var sourceProfile = sourceProfiles.findBy('source', source.source);
	        if ( sourceProfile ) {
	          var props = sourceProfile.get('props');
	          var index;
	          if ( props ) {
	            index = props.indexOf(source.prop);
	            if ( index !== -1 ) {
	              props.splice(index, 1);
	              if ( props.length ) {
                  // copy the array, as we depend on computed observation of this property
                  props = props.slice();
  	              sourceProfile.set('props', props);
	                sourceProfile.save();
	              } else {
	                // remove this entire object
	                sourceProfiles.removeObject(sourceProfile);
	                sourceProfile.destroyRecord();
	              }
	            }
	          }
	        }
	      });
	    }
	  }
	}
});
