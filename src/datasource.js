import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.token = instanceSettings.jsonData.humioToken;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + instanceSettings.jsonData.humioToken
    };
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  query(options) {

    var query = this.buildQueryParameters(options);

    console.log(this.url);
    console.log('1 ->');
    console.log('6 ->');
    console.log(this.token);
    // console.log(options);
    // console.log(query);

    query.targets = query.targets.filter(t => !t.hide);

    if (query.targets.length <= 0) {
      return this.q.when({
        data: []
      });
    }

    var dt = {
      "queryString": "timechart()",
      "isLive": false,
      "timeZoneOffsetMinutes": 180,
      "showQueryEventDistribution": true,
      "start": "5m"
    }

    const self = this;

    return this.doRequest({
      url: this.url + '/api/v1/dataspaces/humio/queryjobs',
      data: dt,
      method: 'POST',
    }).then((r) => {

      return self.doRequest({
        url: this.url + '/api/v1/dataspaces/humio/queryjobs/' + r.data.id,
        method: 'GET',
      }).then((r) => {

        var convertEvs = (evs) => {
          return evs.map((ev) => {
            return [ev._count, ev._bucket];
          })
        };

        r.data = [{
          target: "_count",
          datapoints: convertEvs(r.data.events)
        }]

        return r;
      });
    });
  }

  testDatasource() {
    console.log("-> 10");
    return this.doRequest({
      url: this.url + '/',
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return {
          status: "success",
          message: "Data source is working",
          title: "Success"
        };
      }
    });
  }

  annotationQuery(options) {
    console.log("-> 11");
    var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
    var annotationQuery = {
      range: options.range,
      annotation: {
        name: options.annotation.name,
        datasource: options.annotation.datasource,
        enable: options.annotation.enable,
        iconColor: options.annotation.iconColor,
        query: query
      },
      rangeRaw: options.rangeRaw
    };

    return this.doRequest({
      url: this.url + '/annotations',
      method: 'POST',
      data: annotationQuery
    }).then(result => {
      console.log("8 ->");
      console.log(result.data);
      return result.data;
    });
  }

  metricFindQuery(query) {
    console.log("-> 13");

    // TODO: for now handling only timechart queries
    return [{
      text: "_count",
      value: "_count",
    }];
  }

  mapToTextValue(result) {
    console.log("-> 14");
    return _.map(result.data, (d, i) => {
      if (d && d.text && d.value) {
        return {
          text: d.text,
          value: d.value
        };
      } else if (_.isObject(d)) {
        return {
          text: d,
          value: i
        };
      }
      return {
        text: d,
        value: d
      };
    });
  }

  doRequest(options) {
    console.log("-> 15");
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return this.backendSrv.datasourceRequest(options);
  }

  buildQueryParameters(options) {
    console.log("-> 16");
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });

    var targets = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(target.target, options.scopedVars, 'regex'),
        refId: target.refId,
        hide: target.hide,
        type: target.type || 'timeserie'
      };
    });

    options.targets = targets;

    return options;
  }
}