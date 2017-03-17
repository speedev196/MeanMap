'use strict';

app.controller('registerCtrl', ['$scope', 'loginService', 'FlashService', '$rootScope', 'Base64',
    function($scope, loginService, FlashService, $rootScope, Base64) {

        $scope.email = "";
        $scope.pass = "";
        if ($rootScope.globals.currentUser) {
            var str = Base64.decode($rootScope.globals.currentUser.authdata);
            var strs = str.split(':');
            if (strs[2] == 'local') {
                $scope.email = $rootScope.globals.currentUser.email;
                $scope.pass = strs[1];

            }
        }


        $scope.SingUp = function(data) {
            if (data.name == null || data.email == null || data.pass1 == null || data.pass2 == null) return;
            if (data.pass1 != data.pass2) {
                FlashService.Error('Password is not match.');
                return;
            }
            loginService.register(data);
        };
        $scope.Login = function() {
            if ($scope.email == null || $scope.pass == null) return;

            loginService.Login($scope.email, $scope.pass, $scope.rem);
        };
        $scope.GoogleLogin = function() {
            loginService.googlelogin($scope.rem);
        };

        $scope.FacebookLogin = function() {
            loginService.facebooklogin($scope.rem);
        };

    }
]);