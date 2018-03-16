System.register(["./DsPanelStorage"], function(exports_1) {
    var DsPanelStorage_1;
    var GenericDatasource;
    return {
        setters:[
            function (DsPanelStorage_1_1) {
                DsPanelStorage_1 = DsPanelStorage_1_1;
            }],
        execute: function() {
            GenericDatasource = (function () {
                /** @ngInject */
                function GenericDatasource(instanceSettings, $q, backendSrv, $location, $rootScope, $http) {
                    console.log('--------------------------------');
                    console.log(instanceSettings);
                    $http({
                        url: "/api/datasources/11",
                        method: "GET",
                    }).then(function (res) {
                        console.log(res);
                    });
                    this.type = instanceSettings.type;
                    this.url = instanceSettings.url ? instanceSettings.url.replace(/\/$/, "") : "";
                    this.actualUrl = instanceSettings.jsonData.url;
                    this.name = instanceSettings.name;
                    this.dsAttrs = {
                        $q: $q,
                        $location: $location,
                        backendSrv: backendSrv,
                        $rootScope: $rootScope
                    };
                    this.headers = {
                        "Content-Type": "application/json",
                    };
                    this.dsPanelStorage = new DsPanelStorage_1.default();
                    this.timeRange = null;
                    this.doRequest = this.doRequest.bind(this);
                }
                GenericDatasource.prototype.query = function (options) {
                    var _this = this;
                    this.timeRange = options.range;
                    // NOTE: if no tragests just return an empty result
                    if (options.targets.length === 0) {
                        return this.dsAttrs.$q.resolve({
                            data: []
                        });
                    }
                    var panelId = options.panelId;
                    // TODO: take a look at the second argument
                    var dsPanel = this.dsPanelStorage.getOrGreatePanel(panelId);
                    if (dsPanel) {
                        var grafanaAttrs = {
                            grafanaQueryOpts: options,
                            errorCb: function (errorTitle, errorBody) {
                                _this.dsAttrs.$rootScope.appEvent(errorTitle, errorBody);
                            },
                            doRequest: this.doRequest
                        };
                        return dsPanel.update(this.dsAttrs, grafanaAttrs, options.targets);
                    }
                    else {
                        // TODO: handle the case
                        return this.dsAttrs.$q.resolve({
                            data: []
                        });
                    }
                };
                GenericDatasource.prototype.testDatasource = function () {
                    return this.doRequest({
                        url: "/api/v1/users/current",
                        method: "GET",
                    }).then(function (response) {
                        if (response.status === 200) {
                            return {
                                status: "success",
                                message: "Data source is working",
                                title: "Success"
                            };
                        }
                    });
                };
                GenericDatasource.prototype.doRequest = function (options) {
                    options.headers = this.headers;
                    options.url = this.url + "/humio-authenticated" + options.url; // NOTE: adding base
                    return this.dsAttrs.backendSrv.datasourceRequest(options);
                };
                return GenericDatasource;
            })();
            exports_1("GenericDatasource", GenericDatasource);
        }
    }
});
//# sourceMappingURL=datasource.js.map