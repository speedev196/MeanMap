'use strict';

app.controller('mainCtrl', ['$scope', 'modals', '$http', '$window', 'loginService', '$rootScope',
    function($scope, modals, $http, $window, loginService, $rootScope) {

        $scope.closenav = false;

        $scope.SignOut = function() {
            loginService.logout();
        }

        $scope.SignIn = function() {
            loginService.logInPage();
        };


        if ($rootScope.globals.currentUser) {
            /*   var str = Base64.decode($rootScope.globals.currentUser.authdata);
               var strs = str.split(':');
               if (strs[2] == 'local') {
                   $scope.email = $rootScope.globals.currentUser.email;
                   $scope.pass = strs[1];

               }*/
            $scope.sign_status = true;
        } else {
            $scope.sign_status = false;
        }

        $scope.PostPage = function() {
            if ($scope.sign_status) loginService.postpage();
            else {
                var promise = modals.open(
                    "prompt", {
                        message: "Who rocks the party the rocks the body?",
                        placeholder: "MC Lyte."
                    }
                );
                promise.then(
                    function handleResolve(response) {
                        //							console.log( "Prompt resolved with [ %s ].", response );

                    },
                    function handleReject(error) {
                        //							console.warn( "Prompt rejected!" );
                    }
                );
            }
        };

        $scope.openNav = function() {

            if ($window.innerWidth < 700) {
                document.getElementById("mySidenav").style.width = "0px";
                document.getElementById('openNavSpan').style.display = 'block';

                return;
            }
            if (document.getElementById("mySidenav") != undefined) {

                document.getElementById("mySidenav").style.width = "350px";

            }
            //      document.getElementById("mySidenav").style.zIndex = "1000";
            $scope.closenav = true;

            Autocomplete();
            var names = document.getElementsByClassName('itemname');
            for (var i = 0; i < names.length; i++) {
                names[i].style.display = "block";
            }
            var descs = document.getElementsByClassName('itemdesc');

            for (var i = 0; i < descs.length; i++) {
                descs[i].style.display = "block";
            }

            var descs = document.getElementsByClassName('imageView');
            for (var i = 0; i < descs.length; i++) {
                descs[i].style.marginLeft = "15%";
            }

        }
        var input = document.getElementById('pac-input');
        $scope.closeNav = function() {
            $scope.closenav = false;

            document.getElementById("mySidenav").style.width = "120px";
            document.getElementById('openNavSpan').style.display = 'none';

            Autocomplete();

            var names = document.getElementsByClassName('itemname');
            for (var i = 0; i < names.length; i++) {
                names[i].style.display = "none";
            }
            var descs = document.getElementsByClassName('itemdesc');

            for (var i = 0; i < descs.length; i++) {
                descs[i].style.display = "none";
            }

            //       $scope.FormShow = false;
            var descs = document.getElementsByClassName('imageView');
            for (var i = 0; i < descs.length; i++) {
                descs[i].style.marginLeft = "0";
            }


        }
        var w = angular.element($window);
        w.bind('resize', function() {
            //        console.log('resize' + $window.innerWidth);
            if ($window.innerWidth < 700) {
                if ($scope.closenav == true) $scope.closeNav();

            }

        });
        $scope.FormShow = false;
        $scope.list = {};

        var sel_element = null;

        $scope.onshow = function($event, item) {

            var ele = angular.element($event.currentTarget).parent();
            // var ele = angular.element($event.currentTarget);


            if (ele != sel_element) {
                if (sel_element != null) {
                    sel_element.removeClass('fairyactive');
                }
                ele.addClass('fairyactive');
                sel_element = ele;
            }


            $scope.FormShow = true;
            $scope.list = item;
            var point = item.loc;
            var pos = {
                lat: point[1],
                lng: point[0]
            };

            my_map.setCenter(pos);
            var myLatlng = new google.maps.LatLng(point[1], point[0]);
            var marker = new google.maps.Marker({
                position: myLatlng,
                title: item.name
            });

            // Clear out the old markers.
            markers.forEach(function(marker) {
                marker.setMap(null);
            });
            markers = [];
            markers.push(marker);

            // To add the marker to the map, call setMap();
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(my_map);
            }



        }
        $scope.sel_img = "";
        $scope.modalShow = function(one) {
            $scope.sel_img = one;
            var promise = modals.open(
                "prompt", {
                    message: "Who rocks the party the rocks the body?",
                    placeholder: "MC Lyte."
                }
            );
            promise.then(
                function handleResolve(response) {
                    //							console.log( "Prompt resolved with [ %s ].", response );

                },
                function handleReject(error) {
                    //							console.warn( "Prompt rejected!" );
                }
            );
        }
        var imagediv = document.getElementById('imagediv');

        $scope.closeForm = function() {
            $scope.FormShow = false;

        }


        var span = document.getElementById('openNavSpan');

        var my_map = null;
        var searchBox;
        var markers = [];
        var infoWindow;
        initAutocomplete();

        /*   function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        //      var start = document.getElementById('start').value;
        //      var end = document.getElementById('end').value;
        directionsService.route({
            origin: 'chicago, il',
            destination: 'st louis, mo',
            travelMode: 'DRIVING'
        }, function(response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
                console.log('response=' + JSON.stringify(response));
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

*/
        function handleLocationError(browserHasGeolocation, infoWindow, pos) {
            infoWindow.setPosition(pos);
            infoWindow.setContent(browserHasGeolocation ?
                'Error: The Geolocation service failed.' :
                'Error: Your browser doesn\'t support geolocation.');
        };



        function initAutocomplete() {
            if (my_map == null) {

                my_map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: -33.8688, lng: 151.2195 },
                    zoom: 15
                });
                my_map.controls[google.maps.ControlPosition.TOP_LEFT].push(span);
                my_map.controls[google.maps.ControlPosition.TOP_LEFT].push(imagediv);
                searchBox = new google.maps.places.SearchBox(input);

                //   var infoWindow = new google.maps.InfoWindow({ map: my_map });
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        var pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        //            console.log('position=' + position);

                        //           infoWindow.setPosition(pos);
                        //           infoWindow.setContent('Current location.');

                        my_map.setCenter(pos);
                        var geocoder = new google.maps.Geocoder();
                        var myLatlng = new google.maps.LatLng(pos.lat, pos.lng);

                        geocoder.geocode({ 'latLng': myLatlng }, function(results, status) {

                            if (status == google.maps.GeocoderStatus.OK) {

                                if (results[1]) {

                                    var cur_location = results[0].formatted_address;

                                    var marker = new google.maps.Marker({
                                        position: myLatlng,
                                        icon: "http://maps.google.com/mapfiles/ms/icons/blue-pushpin.png",
                                        title: cur_location
                                    });
                                    marker.setMap(my_map);

                                } else {
                                    alert("No results found");
                                }
                            } else {
                                alert("Geocoder failed due to: " + status);
                            }

                        });

                        //  if ($window.innerWidth < 700) $scope.closeNav();
                        $scope.openNav();
                        if ($window.innerWidth < 700) {
                            setTimeout(function() {
                                //your code to be executed after 1 second
                                $scope.closeNav();
                            }, 500);
                        }

                        queryUsers(pos.lng, pos.lat);


                        /*              var directionsDisplay = new google.maps.DirectionsRenderer;
                    var directionsService = new google.maps.DirectionsService;
                    directionsDisplay.setMap(my_map);
                    directionsDisplay.setPanel(document.getElementById('right-panel'));
                    calculateAndDisplayRoute(directionsService, directionsDisplay);

*/


                    }, function() {
                        //            handleLocationError(true, infoWindow, my_map.getCenter());
                        console.log('Error: The Geolocation service failed.');
                    });
                } else {
                    // Browser doesn't support Geolocation
                    //       handleLocationError(false, infoWindow, my_map.getCenter());
                    console.log('server can not provide current position!!!');
                }
            }

        }



        // Creates a new user based on the form fields
        function CreateData(x, y) {

            // Grabs all of the text box fields
            var userData = {
                name: 'NSK Trade',
                address: 'Kuchai Lama',
                loc: [x, y],
                description: 'My Favaorite market',
                likes: 144,
                tags: ['facilities', 'trail', 'picnic'],
                images: ['https://res.cloudinary.com/idemo/image/upload/ar_315:250,c_fill,e_saturation:50,g_faces,r_50,w_500/woman.jpg'],
                thumbnail: 'http://res.cloudinary.com/dmiwf27zw/image/upload/c_thumb,h_80,r_15,w_80/v1471934331/City_Botanic_Gardens_9524460_ptwtda.jpg',
                posted_user: 'admin'
            };

            // Saves the user data to the db
            $http.post('/users', userData)
                .success(function(data) {
                    //               console.log('Insert OK!!!=' + JSON.stringify(data));
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        };

        function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2 - lat1); // deg2rad below
            var dLon = deg2rad(lon2 - lon1);
            var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            return d;
        }

        function deg2rad(deg) {
            return deg * (Math.PI / 180);
        }


        $scope.lists = [];
        // Take query parameters and incorporate into a JSON queryBody
        function queryUsers(x, y) {

            // Assemble Query Body
            var queryBody = {
                longitude: x,
                latitude: y
            };

            // Post the queryBody to the /query POST route to retrieve the filtered results
            $http.post('/query', queryBody)

            // Store the filtered results in queryResults
            .success(function(queryResults) {

                    var results = queryResults;
                    if (results.length != 0) {
                        for (var i = 0; i < results.length; i++) {
                            var point = results[i].loc;
                            results[i].direction = "https://maps.google.com?saddr=" + y + "," + x + "&daddr=" + point[1] + "," + point[0];
                            results[i].distance = getDistanceFromLatLonInKm(y, x, point[1], point[0]).toFixed(3);
                            //                 console.log('link=' + results[i].distance);

                            /* for (var j = 0; j < results[i].tags.length; j++) {
                                 results[i].tags[j] = "/img/tag/" + results[i].tags[j] + ".png";
                             }*/
                        }
                    }
                    //           console.log('result=' + JSON.stringify(results));
                    $scope.lists = results;
                })
                .error(function(queryResults) {
                    console.log('Error ' + queryResults);
                })
        };



        var cur_lat = null;
        var cur_lng = null;

        function Autocomplete() {
            my_map.addListener('bounds_changed', function() {
                searchBox.setBounds(my_map.getBounds());
            });


            searchBox.addListener('places_changed', function() {


                var places = searchBox.getPlaces();
                //      console.log('place_changed=' + JSON.stringify(places));

                cur_lat = places[0].geometry.location.lat();
                cur_lng = places[0].geometry.location.lng();

                //CreateData(cur_lng, cur_lat);
                queryUsers(cur_lng, cur_lat);

                if (places.length == 0) {
                    return;
                }

                // Clear out the old markers.
                markers.forEach(function(marker) {
                    marker.setMap(null);
                });
                markers = [];

                // For each place, get the icon, name and location.
                var bounds = new google.maps.LatLngBounds();
                places.forEach(function(place) {
                    if (!place.geometry) {
                        console.log("Returned place contains no geometry");
                        return;
                    }
                    var icon = {
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25)
                    };

                    // Create a marker for each place.
                    markers.push(new google.maps.Marker({
                        map: my_map,
                        icon: icon,
                        title: place.name,
                        position: place.geometry.location
                    }));

                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                my_map.fitBounds(bounds);
            });
        }





    }
]);