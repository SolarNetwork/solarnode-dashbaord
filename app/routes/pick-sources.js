import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

const ignoreProps = { 'nodeId' : true };

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  clientHelper:  Ember.inject.service(),
  userService: Ember.inject.service(),

  model() {
    return Ember.RSVP.hash({
      availableData: this.dataPerPropertyPerSource(),
      userProfile: new Ember.RSVP.Promise((resolve, reject) => {
        this.get('userService.activeUser').then(function(user) {
          resolve(user.get('profile'));
        }, reject);
      })
    });
  },

  dataPerPropertyPerSource() {
		// get all available data within the last week
		const endDate = new Date();
		const startDate = d3.time.day.offset(endDate, -1);
    const urlHelper = this.get('clientHelper.nodeUrlHelper');
    const load = Ember.RSVP.denodeify(sn.api.datum.loader([], urlHelper, startDate, endDate, 'Hour'));
    return load().then(function(results) {
      if ( !results || !Array.isArray(results) ) {
        throw new Error("Unable to load data");
      }

      var dataBySource = d3.nest()
        .key(function(d) { return d.sourceId; })
        .sortKeys(d3.ascending)
        .entries(results);

      var dataByLine = [];
      dataBySource.forEach((sourceData) => {
        // sourceData like { key : 'foo', values : [ ... ] }
        var templateObj = sourceData.values[0];

        // get properties of first object only
        var sourcePlotProperties = Object.keys(templateObj).filter(function(key) {
          return (!ignoreProps[key] && typeof templateObj[key] === 'number');
        }).sort();
        sourcePlotProperties.forEach((plotProp) => {
          var lineId = sourceData.key + '-' + plotProp,
            lineData = { key : lineId, source : sourceData.key, prop : plotProp, values : sourceData.values };
          dataByLine.push(lineData);
        });
      });
      return dataByLine;
    });
	}

});
