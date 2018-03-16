import { QueryCtrl } from "app/plugins/sdk";
declare class GenericDatasourceQueryCtrl extends QueryCtrl {
    static templateUrl: string;
    $http: any;
    $scope: any;
    $q: any;
    $location: any;
    dataspaces: any[];
    datasource: any;
    originalUrl: string;
    target: any;
    panelCtrl: any;
    constructor($scope: any, $injector: any, $http: any, $q: any, datasourceSrv: any, $location: any);
    getHumioLink(): string;
    onChangeInternal(): void;
    showHumioLink(): boolean;
    _serializeQueryOpts(obj: any): string;
    _getHumioDataspaces(): any;
}
export default GenericDatasourceQueryCtrl;
