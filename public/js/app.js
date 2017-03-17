var app = angular.module('meanMapApp', ['ngRoute', 'ngSanitize', 'ngS3upload', 'ngCookies', 'google-signin', 'ngFacebook'])

.config(function($routeProvider, GoogleSigninProvider, $facebookProvider) {

    $routeProvider.when('/login', {
            templateUrl: 'partials/loginform.html',
            controller: 'registerCtrl'
        })
        .when('/register', {
            templateUrl: 'partials/registerform.html',
            controller: 'registerCtrl'
        })
        .when('/post', {
            templateUrl: 'partials/postform.html',
            controller: 'postCtrl'
        })
        .when('/main', {
            templateUrl: 'partials/mainform.html',
            controller: 'mainCtrl'
        })
        .otherwise({ redirectTo: '/main' });
    GoogleSigninProvider.init({
        client_id: '350684185205-sdd88llek5vod9edh4ph6ooabfbp0va5.apps.googleusercontent.com',
        clientSecret: 'B-Co7re-vDIBrf9K_WSMs3Gg'
    });
    $facebookProvider.setAppId('1600466653586188').setPermissions(['email']);
});

app.run(['$rootScope', '$location', '$cookieStore', '$http', 'loginService', 'sessionService', '$window',
    function($rootScope, $location, $cookieStore, $http, loginService, sessionService, $window) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('MAP_globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line

        }
        $rootScope.$on('$locationChangeStart', function(event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() == '/post' && !$rootScope.globals.currentUser) {
                var connected = loginService.islogged();
                connected.then(function(msg) {
                    var sestorage;
                    if (sessionService.get('uid') == "fairyfinders") sestorage = true;
                    else sestorage = false;

                    if (($location.path() != '/register' && $location.path() != '/forgot_pass' && msg.data != 'OK') ||
                        ($location.path() != '/register' && $location.path() != '/forgot_pass' && sestorage == false)) {
                        $location.path('/main');
                    } else if ($location.path() == '/forgot_pass') {
                        $location.path('/forgot_pass');
                    } else if ($location.path() == '/register') {
                        $location.path('/register');
                    }

                });



            }
        });

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
        $rootScope.$on('fb.load', function() {
            $window.dispatchEvent(new Event('fb.load'));
        });
    }
]);