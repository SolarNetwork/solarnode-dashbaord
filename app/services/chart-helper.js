import Ember from 'ember';
import ChartSuggestion from '../models/chart-suggestion';
import d3 from 'npm:d3';
import sn from 'npm:solarnetwork-d3';

const ignoreSourceDataProps = { 'nodeId' : true };

function dataPerPropertyPerSource(urlHelper) {
  // get all available data within the last week
  const endDate = new Date();
  const startDate = d3.time.day.offset(endDate, -1);
  return new Ember.RSVP.Promise((resolve, reject) => {
    sn.api.datum.loader([], urlHelper, startDate, endDate, 'Hour').callback((error, results) => {
      if ( !results || !Array.isArray(results) ) {
        sn.log("Unable to load data: {1}", error);
        reject(error);
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
      resolve({dataBySource:dataBySource, dataByLine:dataByLine});
    }).load();
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

/**
 Make one more more suggestions from a single set of source data.

 @param {Object} sourceData - An object like { key : "Solar", values : [ ... ] }
 @return {Array} An array of ChartSuggestion objects
 */
function chartSuggestionsFromSourceData(sourceData, i18n) {
  var props = propertiesForSourceData(sourceData);

  var flags = {};

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

  if ( flags.electricity && flags.generation ) {
    return [ChartSuggestion.create({
      type: 'Generation',
      subtype: 'PV',
      flags: flags,
      title: i18n.t('chartSuggestion.generation.title', {source: sourceData.key, subtype:'PV'}).toString(),
      sources: [{source:sourceData.key, props:props}],
      data: sourceData.values,
      sampleConfiguration: {source:sourceData.key, prop:'watts'}
    })];
  } else if ( flags.electricity ) {
    return [ChartSuggestion.create({
      type: 'Consumption',
      flags: flags,
      title: i18n.t('chartSuggestion.consumption.title', {source: sourceData.key}).toString(),
      sources: [{source:sourceData.key, props:props}],
      data: sourceData.values,
      sampleConfiguration: {source:sourceData.key, prop:'watts'}
    })];
  } else {
    // unknown, use General
    return [ChartSuggestion.create({
      flags: flags,
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

  dataForChart(chartConfig) {
    // TODO: start, end, aggregate etc in ChartConfig model

    const urlHelper = this.get('clientHelper.nodeUrlHelper');
    const endDate = new Date();
    const aggregate = 'Hour';
    const range = sn.api.datum.loaderQueryRange(aggregate, 7, endDate); // note 7 is days!

    return chartConfig.get('sources').then(sources => {
      const loadSets = sources.map(sourceProfile => {
        return sn.api.datum.loader([sourceProfile.get('source')], urlHelper, range.start, range.end, aggregate);
      });
      return new Ember.RSVP.Promise((resolve, reject) => {
        sn.api.datum.multiLoader(loadSets).callback((error, results) => {
          if ( !results || !Array.isArray(results) || results.length !== sources.length ) {
            sn.log("Unable to load data: {1}", error);
            reject(error);
          }
          var finalData = sources.map((sourceProfile, index) => {
            return {source: sourceProfile, data: results[index]};
          });
          resolve(finalData);
        }).load();
      });
    });
  }

});
