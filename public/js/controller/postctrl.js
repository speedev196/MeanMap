'use strict';

app.controller('postCtrl', ['$scope', 'modals', '$http', '$interval', 'tempService', 'loginService', function($scope, modals, $http, $interval, tempService, loginService) {


    $scope.openNav = function() {
        document.getElementById("mySidenav").style.width = "350px";
        //      document.getElementById("mySidenav").style.zIndex = "1000";

        Autocomplete();

    }

    $scope.SignOut = function() {
        loginService.logout();
    };


    var input = document.getElementById('address-input');
    $scope.closeNav = function() {
        document.getElementById("mySidenav").style.width = "0";
        $scope.FormShow = false;
    }
    $scope.FormShow = false;
    $scope.list = {};

    $scope.sel_img = "";

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

            var geocoder = new google.maps.Geocoder();

            google.maps.event.addListener(my_map, 'click', function(event) {
                geocoder.geocode({
                    'latLng': event.latLng
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            //alert(results[0].formatted_address);
                            input.value = results[0].formatted_address;

                            //                   var myLatlng = new google.maps.LatLng(point[1], point[0]);
                            var marker = new google.maps.Marker({
                                position: event.latLng,
                                icon: "http://maps.google.com/mapfiles/ms/icons/red-pushpin.png",
                                title: input.value
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
                    }
                });
            });



            infoWindow = new google.maps.InfoWindow({ map: my_map });
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    //            console.log('position=' + position);

                    //           infoWindow.setPosition(pos);
                    //           infoWindow.setContent('Current location.');
                    $scope.x = pos.lat;
                    $scope.y = pos.lng;
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
                    $scope.openNav();
                    //             queryUsers(pos.lng, pos.lat);


                    /*              var directionsDisplay = new google.maps.DirectionsRenderer;
                    var directionsService = new google.maps.DirectionsService;
                    directionsDisplay.setMap(my_map);
                    directionsDisplay.setPanel(document.getElementById('right-panel'));
                    calculateAndDisplayRoute(directionsService, directionsDisplay);

*/






                }, function() {
                    handleLocationError(true, infoWindow, my_map.getCenter());
                    console.log('Error: The Geolocation service failed.');
                });
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, my_map.getCenter());
                console.log('server can not provide current position!!!');
            }
        }

    }


    $scope.files = {};
    $scope.performUpload = false;
    $scope.UploadFiles = function() {
 //       $scope.performUpload = true;
        $scope.StartTimer();
    };

    $scope.images = false;
    var Timer = null;
    var current_filename = "";
    $scope.StartTimer = function() {
        Timer = $interval(function() {
            var el = document.getElementById('myFileName');
            if (el != undefined) {
                if (el.getAttribute("href") != undefined) {
                    var filename = el.getAttribute("href");
                    if (filename != "" && filename != current_filename) {
                        $scope.StopTimer();
                        current_filename = filename;
                        //                  console.log('current File=' + filename);
                        listFilters(filename);
                        //  $scope.images = true;
                    }
                }
            }

            var el1 = document.getElementById('ErrMessage');
            if (el1 != undefined) {
                if (el1.innerHTML != undefined) {
                    var errText = el1.innerHTML;
                    if (errText == "Can't upload more than 10MB.") {
                        $scope.StopTimer();
                        //                        listFilters(filename);
                    }
                }
            }

        }, 300);
    };

    $scope.StopTimer = function() {
        if (angular.isDefined(Timer)) {
            $interval.cancel(Timer);
            Timer = null;
            $scope.performUpload = false;

        }
    };
    $scope.post_images = [];
    $scope.post_thumbs = "";

    var listFilters = function(fileurl) {
        var elem = '';
        if (document.getElementById('FiltersList') != undefined) {
            elem = document.getElementById("FiltersList").innerHTML;

        }

        var res = fileurl.split("/");
        var post_image = "http://fairyfinders.imgix.net/" + res[res.length - 1];
        $scope.post_images.push(post_image);
        if ($scope.post_images.length == 1) {
            $scope.post_thumbs = post_image + "?w=80";
        }

        $scope.images = true;
        //        console.log('current html=' + elem);

        $scope.newTransaction = tempService.appendhtml(elem, fileurl);


        //      console.log('$scope.newTransaction==' + $scope.newTransaction);

    }
    $scope.PostImage = function() {
        // Grabs all of the text box fields
        var userData = {
            name: $scope.name,
            address: $scope.address,
            loc: [$scope.y, $scope.x],
            description: $scope.description,
            likes: 0,
            tags: $scope.post_tags,
            images: $scope.post_images,
            thumbnail: $scope.post_thumbs,
            posted_user: 'admin'
        };


        console.log('post=' + JSON.stringify(userData));
        // Saves the user data to the db
        $http.post('/postData', userData)
            .success(function(data) {
                //    console.log('Insert OK!!!=' + JSON.stringify(data));
                $scope.ok_result = true;
                var promise = modals.open(
                    "prompt", {
                        message: "Who rocks the party the rocks the body?",
                        placeholder: "MC Lyte."
                    }
                );
                promise.then(
                    function handleResolve(response) {

                    },
                    function handleReject(error) {

                    }
                );
            })
            .error(function(data) {
                console.log('Error: ' + data);
                //    alert("Post Error!");
                $scope.ok_result = false;
                var promise = modals.open(
                    "prompt", {
                        message: "Who rocks the party the rocks the body?",
                        placeholder: "MC Lyte."
                    }
                );
                promise.then(
                    function handleResolve(response) {


                    },
                    function handleReject(error) {

                    }
                );
            });

    };

    $scope.tags = [{
        'img': 'dog',
        'value': ''
    }, {
        'img': 'doors',
        'value': ''
    }, {
        'img': 'facilities',
        'value': ''
    }, {
        'img': 'park',
        'value': ''
    }, {
        'img': 'picnic',
        'value': ''
    }, {
        'img': 'reserve',
        'value': ''
    }, {
        'img': 'trail',
        'value': ''
    }];

    Array.prototype.remove = function() {
        var what, a = arguments,
            L = a.length,
            ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };


    function hasClass(element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }

    $scope.NewPost = function() {
        $scope.name = "";
        $scope.address = "";
        $scope.description = "";
        $scope.post_tags = [];
        $scope.post_images = [];
        $scope.post_thumbs = "";
        /*var htmlstring = document.getElementById("FiltersList").innerHTML;
        htmlstring = (htmlstring.trim) ? htmlstring.trim() : htmlstring.replace(/^\s+/, '');
        if (htmlstring != "") {
            document.getElementById("FiltersList").innerHTML = "";

        }*/
        $('#FiltersList').empty();

        for (var i = 0; i < $scope.tags.length; i++) {
            $scope.tags[i].value = '';
        }
        var imgs = document.getElementsByClassName('img-thumbnail');
        for (var i = 0; i < imgs.length; i++) {
            if (hasClass(imgs[1], 'check'))
                imgs[i].className = "img-thumbnail img-check";
        }
    };

    $scope.post_tags = [];
    $scope.chooseitem = function(event, tag) {
        //event.currentTarget.addClass("check");
        $(event.target).toggleClass('check');
        if (tag.value) {
            tag.value = false;
            $scope.post_tags.remove(tag.img);
        } else {
            tag.value = true;
            $scope.post_tags.push(tag.img);
        }


        //       console.log('current-tag=' + JSON.stringify(tag));

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

            $scope.x = cur_lat;
            $scope.y = cur_lng;


            //CreateData(cur_lng, cur_lat);
            //         queryUsers(cur_lng, cur_lat);

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





}]);