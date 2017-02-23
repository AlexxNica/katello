/**
 * @ngdoc object
 * @name  Bastion.sync-plans.controller:SyncPlanProductsController
 *
 * @requires $scope
 * @requires $q
 * @requires $location
 * @requires translate
 * @requires SyncPlan
 * @requires Product
 * @requires CurrentOrganization
 * @requires Nutupane
 *
 * @description
 *   Provides the functionality for the sync plan list products details action pane.
 */
angular.module('Bastion.sync-plans').controller('SyncPlanProductsController',
    ['$scope', '$q', '$location', 'translate', 'SyncPlan', 'Product', 'CurrentOrganization', 'Nutupane',
        function ($scope, $q, $location, translate, SyncPlan, Product, CurrentOrganization, Nutupane) {
            var productsNutupane, params;

            $scope.successMessages = [];
            $scope.errorMessages = [];

            $scope.table = {};

            params = {
                'search': $location.search().search || "",
                'sort_by': 'name',
                'sort_order': 'ASC',
                'full_result': true,
                'organization_id': CurrentOrganization,
                'sync_plan_id': $scope.$stateParams.syncPlanId
            };

            productsNutupane = new Nutupane(Product, params);
            $scope.controllerName = 'katello_products';
            $scope.table = productsNutupane.table;

            $scope.removeProducts = function () {
                var data,
                    success,
                    error,
                    deferred = $q.defer(),
                    productsToRemove = _.map($scope.table.getSelected(), 'id');

                data = {
                    "product_ids": productsToRemove
                };

                success = function (response) {
                    $scope.successMessages = [translate('Removed %x products from sync plan "%y".')
                        .replace('%x', $scope.table.numSelected).replace('%y', $scope.syncPlan.name)];
                    $scope.table.working = false;
                    $scope.table.selectAll(false);
                    productsNutupane.refresh();
                    $scope.syncPlan.$get();
                    deferred.resolve(response);
                };

                error = function (response) {
                    deferred.reject(response.data.errors);
                    $scope.errorMessages = response.data.errors;
                    $scope.table.working = false;
                };

                $scope.table.working = true;
                SyncPlan.removeProducts({id: $scope.syncPlan.id}, data, success, error);
                return deferred.promise;
            };
        }]
);
