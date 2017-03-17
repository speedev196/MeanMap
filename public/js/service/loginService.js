'use strict';
app.factory('loginService', function($http, $location, $rootScope, sessionService, FlashService, Base64, GoogleSignin, $facebook) {
    var facebook_status;
    return {
        Login: function(email, pass, rem) {
            var user = {
                'email': email,
                'pass': pass,
                'rem': rem
            };
            $http.post('/loginUser', user)
                .success(function(data) {
                    if (data.status == 'err') {
                        //    alert(data.data);
                        FlashService.Error(data.data);
                    } else if (data.status == 'ok') {
                        //    alert("Create OK!");
                        FlashService.Success('Login OK!');
                        sessionService.set('uid', "fairyfinders");

                        if (user.rem == true) sessionService.SetCredentials(user, 'local');
                        else {
                            var authdata = Base64.encode(user.email + ':' + user.pass + ':local');
                            $rootScope.globals = {
                                currentUser: {
                                    email: user.email,
                                    authdata: authdata
                                }
                            };
                        }




                        $location.path('/post');
                    }
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                    FlashService.Error('Log in fail. issue:' + data);

                });


        },

        register: function(user) {
            // Saves the user data to the db
            $http.post('/registerUser', user)
                .success(function(data) {
                    //console.log('Insert OK!!!=' + JSON.stringify(data));
                    //alert("Create OK!");
                    if (data.status == 'err') {
                        //    alert(data.data);
                        FlashService.Error(data.data);
                    } else if (data.status == 'ok') {
                        //    alert("Create OK!");
                        FlashService.Success('User created');
                        sessionService.set('uid', "fairyfinders");

                        var authdata = Base64.encode(user.email + ':' + user.pass1 + ':local');
                        $rootScope.globals = {
                            currentUser: {
                                email: user.email,
                                authdata: authdata
                            }
                        };

                        $location.path('/login');
                    }

                })
                .error(function(data) {
                    console.log('Error: ' + data);
                    // alert("Create Error!");
                    FlashService.Error('Sing up fail. issue:' + data);

                });
        },
        logout: function() {
            if ($rootScope.globals.currentUser) {
                var str = Base64.decode($rootScope.globals.currentUser.authdata);
                var strs = str.split(':');
                if (strs[2] == 'facebook') {
                    if (facebook_status) $facebook.logout();
                    sessionService.destroy('uid');
                    sessionService.ClearCredentials();
                    $location.path('/main');
                } else if (strs[2] == 'google') {
                    GoogleSignin.signOut().then(function() {
                        sessionService.destroy('uid');
                        sessionService.ClearCredentials();
                        $location.path('/main');
                    }, function(err) {

                        FlashService.Error('Google Log out Failure:' + err);
                    });
                } else if (strs[2] == 'local') {
                    sessionService.destroy('uid');
                    sessionService.ClearCredentials();
                    $location.path('/main');

                }
            }




        },

        logInPage: function() {
            $location.path('/login');
        },
        postpage: function() {
            $location.paht('/post');
        },
        googlelogin: function(rem) {
            GoogleSignin.signIn().then(function(user) {
                console.log(user);
                var data = {
                    'email': user.w3.U3,
                    'pass': user.w3.ig,
                    'rem': rem
                };

                $http.post('/googleLogin', data)
                    .success(function(ret) {
                        if (ret.status == 'err') {
                            //    alert(data.data);
                            FlashService.Error(ret.data);
                        } else if (ret.status == 'ok') {
                            //    alert("Create OK!");
                            FlashService.Success('Login OK!');
                            sessionService.set('uid', "fairyfinders");

                            if (data.rem == true) sessionService.SetCredentials(data, 'google');
                            else {
                                var authdata = Base64.encode(user.email + ':' + user.pass + ':google');
                                $rootScope.globals = {
                                    currentUser: {
                                        email: user.email,
                                        authdata: authdata
                                    }
                                };
                            }
                            $location.path('/post');
                        }
                    })
                    .error(function(ret) {
                        console.log('Error: ' + ret);
                        FlashService.Error('Log in fail. issue:' + ret);

                    });


            }, function(err) {
                FlashService.Error('Log in fail. issue:' + err);

            });
        },
        facebooklogin: function(rem) {
            $facebook.login();
            FB.Event.subscribe('auth.authResponseChange', function() {
                facebook_status = $facebook.isConnected();
                if (facebook_status) {
                    $facebook.api('/me').then(function(user) {
                        //  console.log('FB user=' + JSON.stringify(user));
                        var value = {
                            'email': user.id,
                            'pass': user.name,
                            'rem': rem
                        };
                        $http.post('/facebookLogin', value)
                            .success(function(ret) {
                                if (ret.status == 'err') {
                                    //    alert(data.data);
                                    FlashService.Error(ret.data);
                                } else if (ret.status == 'ok') {
                                    //    alert("Create OK!");
                                    FlashService.Success('Login OK!');
                                    sessionService.set('uid', "fairyfinders");

                                    if (value.rem == true) sessionService.SetCredentials(value, 'facebook');
                                    else {
                                        var authdata = Base64.encode(value.email + ':' + value.pass + ':facebook');
                                        $rootScope.globals = {
                                            currentUser: {
                                                email: value.email,
                                                authdata: authdata
                                            }
                                        };
                                    }
                                    $location.path('/post');
                                }
                            })
                            .error(function(ret) {
                                console.log('Error: ' + ret);
                                FlashService.Error('Log in fail. issue:' + ret);

                            });





                    });
                }
            });
        },
        islogged: function() {
            var $checkSessionServer = $http.post('/check_session');
            return $checkSessionServer;
        }
    }
});


app.factory('Base64', function() {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function(input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function(input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

    /* jshint ignore:end */
});