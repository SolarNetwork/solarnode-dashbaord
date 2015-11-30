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

/**
 Get an array of ChartPropertyConfig objects based on a set of data.

 @param {Array} sourceData - The array of source data to inspect.
 @param {Object} flags - An object to populate flag keys into.
 @return {Array} Array of ChartPropertyConfig compatible objects.
 */
function propertiesForSourceData(sourceData, flags) {
  if ( !(sourceData && sourceData.values && sourceData.values.length > 0) ) {
    return [];
  }

  // get properties of first object only
  var templateObj = sourceData.values[0];
  var propKeys = Object.keys(templateObj).filter(function(key) {
    return (!ignoreSourceDataProps[key] && typeof templateObj[key] === 'number');
  }).sort();
  return propKeys.map(function(key) {
    if ( flags ) {
      // look for "watts" for electricity
      if ( key === 'watts' ) {
        flags.electricity = true;
      } else if ( key === "dcVoltage" ) {
        // "dcVoltage" take for PV generation
        flags.generation = true;
        flags.pv = true;
      } else if ( key === "wattHoursReverse" ) {
        // "wattHoursReverse" take for a meter
        flags.meter = true;
      } else if ( key === "phaseVoltage" || key === "frequency" || key === "powerFactor" ) {
        // look for signs of AC power
        flags.ac = true;
        if ( templateObj.phase && templateObj.phase !== 'Total' ) {
          flags.phase = true;
        }
      } else  if ( key === "temp" ) {
        flags.atmosphere = true;
      }
    }
    return {prop:key};
  });
}

/**
 Make one more more suggestions from a single set of source data.

 @param {Object} sourceData - An object like { key : "Solar", values : [ ... ] }
 @return {Array} An array of ChartSuggestion objects
 */
function chartSuggestionsFromSourceData(sourceData, i18n) {
  const flags = {};
  const props = propertiesForSourceData(sourceData, flags); // array of ChartPropertyConfig

  if ( flags.electricity && flags.generation ) {
    return [ChartSuggestion.create({
      type: 'Generation',
      subtype: 'PV',
      style: 'line',
      flags: flags,
      title: i18n.t('chartSuggestion.generation.title', {source: sourceData.key, subtype:'PV'}).toString(),
      sources: [{source:sourceData.key, props:props}],
      data: sourceData.values,
      sampleConfiguration: {source:sourceData.key, prop:'watts'}
    })];
  } else if ( flags.electricity ) {
    return [ChartSuggestion.create({
      type: 'Consumption',
      style: 'line',
      flags: flags,
      title: i18n.t('chartSuggestion.consumption.title', {source: sourceData.key}).toString(),
      sources: [{source:sourceData.key, props:props}],
      data: sourceData.values,
      sampleConfiguration: {source:sourceData.key, prop:'watts'}
    })];
  } else {
    // unknown, use General
    return [ChartSuggestion.create({
      style: 'line',
      flags: flags,
      title: i18n.t('chartSuggestion.general.title', {source:sourceData.key}).toString(),
      sources: [{source:sourceData.key, props:props}],
      data: sourceData.values,
      sampleConfiguration: {source:sourceData.key, prop:props[0].prop}
    })];
  }
}

function sourceGroupForSuggestions(suggestions, key, title, prop) {
  const sources = [];
  const data = [];
  const flags = {};
  suggestions.forEach(function(suggestion) {
    sources.push.apply(sources, suggestion.get('sources').map(function(source) {
      return source.source;
    }));
    Ember.merge(flags, suggestion.get('flags'));
    data.splice.apply(data, [data.length, 0].concat(suggestion.get('data')));
  });
  return {
    groupId: key,
    title: title,
    flags: flags,
    sourceIds: sources,
    data: data,
    prop: prop
  };
}

function groupedChartSuggestionsFromSuggestions(suggestions, i18n) {
  if ( !Array.isArray(suggestions) || suggestions.length < 2 ) {
    return [];
  }
  const typeGroups = d3.nest().key(function(d) {
    return d.get('type');
  }).map(suggestions);
  const results = [];
  if ( typeGroups.Generation && typeGroups.Consumption ) {
    // we've got IO chart potential here
    let flags = typeGroups.Generation.reduce(function(l, r) {
      return Ember.merge(l, r.get('flags'));
    }, {});

    // exclude phase consumption sources
    let consumptionSuggestions = typeGroups.Consumption.filter(function(suggestion) {
      return !suggestion.flags.phase;
    });
    if ( consumptionSuggestions.length > 0 ) {
      flags = consumptionSuggestions.reduce(function(l, r) {
        return Ember.merge(l, r.get('flags'));
      }, flags);
      let generationGroup = sourceGroupForSuggestions(typeGroups.Generation, 'Generation', i18n.t('chartSuggestion.group.generation').toString(), 'wattHours');
      let consumptionGroup = sourceGroupForSuggestions(consumptionSuggestions, 'Consumption', i18n.t('chartSuggestion.group.consumption').toString(), 'wattHours');
      results.push(ChartSuggestion.create({
        type: 'Energy I/O',
        style: 'io-bar',
        flags: flags,
        title: i18n.t('chartSuggestion.energy-io.title').toString(),
        sourceGroups: [generationGroup, consumptionGroup],
        sampleConfiguration: {prop:generationGroup.prop}
      }));
    }
  }
  return results;
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

        // look for grouped charts, e.g. energy IO
        results = groupedChartSuggestionsFromSuggestions(results, i18n).concat(results);

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
      // now the sources properties are resolved, so map them to source sets
      return groups.map(function (group) {
        var sources = group.get('sources'); // these are already resolved
        var sourceSet = sources.reduce(function(sourceSet, sourceConfig) {
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
