'use strict';
app.factory('sessionService', ['$http', 'Base64', '$rootScope', '$cookieStore', function($http, Base64, $rootScope, $cookieStore) {
    return {
        set: function(key, value) {
            return sessionStorage.setItem(key, value);

        },
        get: function(key) {
            return sessionStorage.getItem(key);

        },
        destroy: function(key) {
            $http.post('/destroy_session');
            return sessionStorage.removeItem(key);

        },
        remove: function(key) {
            return sessionStorage.removeItem(key);

        },
        SetCredentials: function(user, str) {

            var authdata;
            authdata = Base64.encode(user.email + ':' + user.pass + ':' + str);

            $rootScope.globals = {
                currentUser: {
                    email: user.email,
                    authdata: authdata
                }
            };

            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('MAP_globals', $rootScope.globals);
        },
        ClearCredentials: function() {
            $rootScope.globals = {};
            $cookieStore.remove('MAP_globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        }
    };
}])