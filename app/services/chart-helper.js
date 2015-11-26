import Ember from 'ember';
import ChartSuggestion from '../models/chart-suggestion';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

const ignoreSourceDataProps = { 'nodeId' : true };

function dataPerPropertyPerSource(urlHelper) {
  // get all available data within the last week
  const endDate = new Date();
  const startDate = d3.time.day.offset(endDate, -1);
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
      var sourcePlotProperties = propertiesForSourceData(sourceData);
      sourcePlotProperties.forEach((plotProp) => {
        var lineId = sourceData.key + '-' + plotProp,
          lineData = { key : lineId, source : sourceData.key, prop : plotProp, values : sourceData.values };
        dataByLine.push(lineData);
      });
    });
    return {dataBySource:dataBySource, dataByLine:dataByLine};
  });
}

function propertiesForSourceData(sourceData) {
  if ( !(sourceData && sourceData.values && sourceData.values.length > 0) ) {
    return [];
  }

  // get properties of first object only
  var templateObj = sourceData.values[0];
  return Object.keys(templateObj).filter(function(key) {
    return (!ignoreSourceDataProps[key] && typeof templateObj[key] === 'number');
  }).sort();
}

function metadataForProperties(props) {
  const meta = {};
  function setMeta(prop, values) {
    if ( !meta[prop] ) {
      meta[prop] = {};
    }
    Object.keys(values).forEach(function(key) {
      meta[prop][key] = values[key];
    });
  }
  if ( Array.isArray(props) ) {
    props.forEach(function(prop) {
      if ( prop === 'watts' ) {
        setMeta(prop, {unit:'W', unitName:'watts'});
      } else if ( prop.search(/wattHours/i) !== -1 ) {
        setMeta(prop, {unit:'Wh', unitName:'watt hours'});
      } else if ( prop.search(/volt/i) !== -1 ) {
        setMeta(prop, {unit:'V', unitName:'volts'});
      } else if ( prop.search(/current/i) !== -1 ) {
        setMeta(prop, {unit:'A', unitName:'amps'});
      } else if ( prop.search(/frequency/i) !== -1 ) {
        setMeta(prop, {unit:'Hz', unitName:'hertz'});
      } else if ( prop.search(/temp/i) !== -1 ) {
        setMeta(prop, {unit:'°C', unitName:'celsius'});
      }
    });
  }
  return meta;
}

/**
 Make one more more suggestions from a single set of source data.

 @param {Object} sourceData - An object like { key : "Solar", values : [ ... ] }
 @return {Array} An array of ChartSuggestion objects
 */
function chartSuggestionsFromSourceData(sourceData, i18n) {
  const props = propertiesForSourceData(sourceData);
  const meta = metadataForProperties(props);

  const flags = {};

  // look for "watts" for electricity
  if ( props.indexOf("watts") !== -1 ) {
    flags.electricity = true;

    // "dcVoltage" take for PV generation
    if ( props.indexOf("dcVoltage") !== -1 ) {
      flags.generation = true;
      flags.pv = true;
    }

    // "wattHoursReverse" take for a meter
    if ( props.indexOf("wattHoursReverse") !== -1 ) {
      flags.meter = true;
    }

    // look for signs of AC power
    if ( props.indexOf("phaseVoltage") !== -1 || props.indexOf("frequency") !== -1 || props.indexOf("powerFactor") !== -1 ) {
      flags.ac = true;
    }
  }

  if ( props.indexOf("temp") !== -1 ) {
    flags.atmosphere = true;
  }

  if ( flags.electricity && flags.generation ) {
    return [ChartSuggestion.create({
      type: 'Generation',
      subtype: 'PV',
      flags: flags,
      metadata: meta,
      title: i18n.t('chartSuggestion.generation.title', {source: sourceData.key, subtype:'PV'}).toString(),
      sources: [{source:sourceData.key, props:props}],
      data: sourceData.values,
      sampleConfiguration: {source:sourceData.key, prop:'watts'}
    })];
  } else if ( flags.electricity ) {
    return [ChartSuggestion.create({
      type: 'Consumption',
      flags: flags,
      metadata: meta,
      title: i18n.t('chartSuggestion.consumption.title', {source: sourceData.key}).toString(),
      sources: [{source:sourceData.key, props:props}],
      data: sourceData.values,
      sampleConfiguration: {source:sourceData.key, prop:'watts'}
    })];
  } else {
    // unknown, use General
    return [ChartSuggestion.create({
      flags: flags,
      metadata: meta,
      title: i18n.t('chartSuggestion.general.title', {source:sourceData.key}).toString(),
      sources: [{source:sourceData.key, props:props}],
      data: sourceData.values,
      sampleConfiguration: {source:sourceData.key, prop:props[0]}
    })];
  }
}

export default Ember.Service.extend({
  clientHelper:  Ember.inject.service(),
  i18n: Ember.inject.service(),

  /**
   * Get a set of ChartSuggestion objects after querying for a set of sample data.
   */
  makeChartSuggestions() {
    const urlHelper = this.get('clientHelper.nodeUrlHelper');
    return dataPerPropertyPerSource(urlHelper).then(
      (data) => {
        const i18n = this.get('i18n');
        var results = [];
        data.dataBySource.forEach(function(sourceData) {
          var suggestions = chartSuggestionsFromSourceData(sourceData, i18n);
          if ( suggestions && suggestions.length ) {
            results.push.apply(results, suggestions);
          }
        });
        return {dataBySource:data.dataBySource, dataByLine:data.dataByLine, suggestions:results};
      }
    );
  },

  /**
    Get a promise for a set of data for a single chart configuration.

    @return {Array} An array of objects like <code>{group:ChartGroup, groupId:X, sourceIds:[A,...], data:[...]}</code>.
  */
  dataForChart(chartConfig) {
    // TODO: start, end, aggregate etc in ChartConfig model
    var range = {}; // start, end
    const urlHelper = this.get('clientHelper.nodeUrlHelper');
    if ( chartConfig.get('isUsePeriod') ) {
      var period = +chartConfig.get('period');
      range = sn.api.datum.loaderQueryRange(chartConfig.get('periodAggregate'), (period < 1 ? 1 : period), new Date());
      range.aggregate = chartConfig.get('periodAggregate');
    } else {
      range.end = chartConfig.get('endDate');
      range.start = chartConfig.get('startDate');
      range.aggregate = chartConfig.get('aggregate');
    }

    if ( !(range.start && range.end && range.aggregate) ) {
      return Ember.RSVP.reject(new Error('Incomplete chart range, cannot load data.'));
    }

    return chartConfig.get('sourceGroups').then(groups => {
      // first resolve all sources for all groups...
      var sources = groups.getEach('sources');
      return Ember.RSVP.all(sources).then(function() {
        return groups.slice(); // NOT a PromiseArray, we want a regular map() function below
      });
    }).then(groups => {
      // now the sources properties  are resolved, so map them to source sets
      return groups.map(function (group) {
        var sources = group.get('sources'); // these are already resolved
        var sourceSet = sources.reduce(function(sourceSet, sourceConfig, index) {
          sourceSet.sourceIds.push(sourceConfig.get('source'));
          return sourceSet;
        }, {group:group, sourceIds:[]});
        return sourceSet;
      });
    }).then(sourceSets => {
      const loadSets = sourceSets.map(sourceSet => {
        return sn.api.datum.loader(sourceSet.sourceIds, urlHelper, range.start, range.end, range.aggregate);
      });
      return Ember.RSVP.denodeify(sn.api.datum.multiLoader(loadSets))().then(results => {
        if ( !results || !Array.isArray(results) || results.length !== sourceSets.length ) {
          throw new Error("No data available.");
        }
        var finalData = sourceSets.map((sourceSet, index) => {
          return {
            group:sourceSet.group,
            groupId:sourceSet.group.get('id'),
            sourceIds:sourceSet.sourceIds,
            data:results[index]
          };
        });
        return finalData;
      });
    });
  }

});
