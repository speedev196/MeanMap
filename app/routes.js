// Dependencies
var mongoose = require('mongoose');
var Data = require('./model.js');
var crypto = require("crypto");
var User = require("./usermodel.js");
var _ = require('lodash');
var bcrypt = require('bcryptjs');
var session = require('express-session');
var googleUser = require("./googlemodel.js");
var FBUser = require("./fbmodel.js");


// Opens App Routes
module.exports = function(app) {

    app.use(session({
        secret: 'fairy$finders%Secret#Key',
        resave: true,
        saveUninitialized: true
            /*      cookie: { secure: true }  */
    }));
    var sess;


    app.post('/googleLogin', function(req, res) {
        sess = req.session;
        var userParam = _.omit(req.body, 'rem');
        var query = googleUser.findOne({ email: userParam.email });
        // Execute Query and Return the Query Results
        query.exec(function(err, users) {
            if (err)
                res.send(err);
            if (users) {
                sess.email = req.body.email;

                var sendData = {
                    status: 'ok',
                    data: users
                };
                res.json(sendData);

            } else {
                createGoogleUser();
            }

        });


        function createGoogleUser() {
            // set user object to userParam without the cleartext password
            var user = _.omit(userParam, 'pass');
            user.name = userParam.pass;

            var new_data = new googleUser(user);

            new_data.save(function(err) {
                if (err)
                    res.send(err);
                else {
                    // If no errors are found, it responds with a JSON of the new user
                    //   res.json(req.body);
                    sess.email = req.body.email;
                    var sendData = {
                        status: 'ok',
                        data: user
                    };
                    res.json(sendData);

                }
            });
        }

    });

    app.post('/facebookLogin', function(req, res) {
        sess = req.session;
        var userParam = _.omit(req.body, 'rem');
        var query = FBUser.findOne({ id: userParam.email });
        // Execute Query and Return the Query Results
        query.exec(function(err, users) {
            if (err)
                res.send(err);
            if (users) {
                sess.email = req.body.email;

                var sendData = {
                    status: 'ok',
                    data: users
                };
                res.json(sendData);

            } else {
                createFBUser();
            }

        });


        function createFBUser() {
            // set user object to userParam without the cleartext password
            var user = {
                'id': userParam.email,
                'name': userParam.pass
            }
            var new_data = new FBUser(user);

            new_data.save(function(err) {
                if (err)
                    res.send(err);
                else {
                    // If no errors are found, it responds with a JSON of the new user
                    //   res.json(req.body);
                    sess.email = req.body.email;
                    var sendData = {
                        status: 'ok',
                        data: user
                    };
                    res.json(sendData);

                }
            });
        }

    });


    //create user
    app.post('/registerUser', function(req, res) {
        sess = req.session;
        var userParam = req.body;
        var query = User.findOne({ email: userParam.email });
        // Execute Query and Return the Query Results
        query.exec(function(err, users) {
            if (err)
                res.send(err);
            if (users) {
                // If no errors, respond with a JSON of all users that meet the criteria
                var sendData = {
                    status: 'err',
                    data: 'email"' + userParam.email + '" is already taken.'
                };
                res.json(sendData);

            } else {
                createUser();
            }

        });


        function createUser() {
            // set user object to userParam without the cleartext password
            var user = _.omit(userParam, 'pass1');
            user = _.omit(user, 'pass2');
            // add hashed password to user object
            user.hash = bcrypt.hashSync(userParam.pass1, 10);
            var new_data = new User(user);

            new_data.save(function(err) {
                if (err)
                    res.send(err);
                else {
                    // If no errors are found, it responds with a JSON of the new user
                    //   res.json(req.body);
                    sess.email = req.body.email;
                    var sendData = {
                        status: 'ok',
                        data: req.body
                    };
                    res.json(sendData);

                }
            });
        }

    });

    app.post('/check_session', function(req, res) {
        sess = req.session;
        if (sess.email) {

            res.send('OK');
        } else {
            res.send('NO');
        }
    });

    app.post('/destroy_session', function(req, res) {
        sess = req.session;

        if (sess.email) {
            delete sess['email'];
            res.send('OK');
        } else {
            res.send('NO');
        }
    });


    app.post('/loginUser', function(req, res) {

        sess = req.session;

        var user = req.body;
        var query = User.findOne({ email: user.email });
        // Execute Query and Return the Query Results
        query.exec(function(err, users) {
            if (err)
                res.send(err);
            if (users && bcrypt.compareSync(user.pass, users.hash)) {
                // If no errors, respond with a JSON of all users that meet the criteria
                var sendData = {
                    status: 'ok',
                    data: users.id
                };
                sess.email = user.email;
                res.json(sendData);

            } else {
                var sendData = {
                    status: 'err',
                    data: 'Incorrect email or password.'
                };
                res.json(sendData);

            }

        });


    });
    // POST Routes
    app.post('/postData', function(req, res) {

        //    console.log('receive body=' + JSON.stringify(req.body));
        // Creates a new User based on the Mongoose schema and the post bo.dy
        var new_data = new Data(req.body);

        // New User is saved in the db.
        new_data.save(function(err) {
            if (err)
                res.send(err);
            else
            // If no errors are found, it responds with a JSON of the new user
                res.json(req.body);
        });
    });


    // Retrieves JSON records for all users who meet a certain set of query conditions
    app.post('/query', function(req, res) {

        // Grab all of the query parameters from the body.
        var lat = req.body.latitude;
        var long = req.body.longitude;

        // Opens a generic Mongoose Query. Depending on the post body we will...
        var query = Data.find({});

        // Using MongoDB's geospatial querying features. (Note how coordinates are set [long, lat]
        query = query.where('loc').near({
            center: { type: 'Point', coordinates: [long, lat] },
            maxDistance: 100000, //100km
            spherical: true
        });


        // Execute Query and Return the Query Results
        query.exec(function(err, users) {
            if (err)
                res.send(err);
            else
            // If no errors, respond with a JSON of all users that meet the criteria
                res.json(users);
        });
    });



    var s3 = {
        access_key_id: "AKIAJPOCQIF7U5GDYGKQ",
        secret_key: "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",
        bucket: "gpsmap",
        acl: "public-read",
        https: "false",
        error_message: "",
        pad: function(n) {
            if ((n + "").length == 1) {
                return "0" + n;
            }
            return "" + n;
        },
        expiration_date: function() {
            var now = new Date();
            var date = new Date(now.getTime() + (3600 * 1000));
            var ed = date.getFullYear() + "-" + this.pad(date.getMonth() + 1) + "-" + this.pad(date.getDate());
            ed += "T" + this.pad(date.getHours()) + ":" + this.pad(date.getMinutes()) + ":" + this.pad(date.getSeconds()) + ".000Z";
            return ed;
        }
    };

    app.post('/uploadtoken', function(req, res) {
        var aws_access_key = s3.access_key_id; // your acces key to Amazon services (get if from https://portal.aws.amazon.com/gp/aws/securityCredentials)
        var aws_secret_key = s3.secret_key; // secret access key (get it from https://portal.aws.amazon.com/gp/aws/securityCredentials)
        //   console.log('hello API=' + aws_access_key);
        var bucket = s3.bucket; // the name you've chosen for the bucket
        var key = '/${filename}'; // the folder and adress where the file will be uploaded; ${filename} will be replaced by original file name (the folder needs to be public on S3!)
        var success_action_redirect = 'http://localhost:3000/upload/success'; // URL that you will be redirected to when the file will be successfully uploaded
        var content_type = 'image/'; // limit accepted content types; empty will disable the filter; for example: 'image/', 'image/png'
        var acl = s3.acl; // private or public-read

        var policy = {
            "expiration": s3.expiration_date(),
            "conditions": [
                { "bucket": bucket },
                ["starts-with", "$Content-Type", ""],
                { "acl": acl },
                ["starts-with", "$key", ""],
                ["content-length-range", 0, 100485760]
                //             { "success_action_redirect": success_action_redirect },
                //             ["starts-with", "$Content-Type", content_type],
                //             { "x-amz-meta-uuid": "14365123651275" },
                //              ["starts-with", "$x-amz-meta-tag", ""]
            ]
        };
        policy = new Buffer(JSON.stringify(policy)).toString('base64').replace(/\n|\r/, '');
        var hmac = crypto.createHmac("sha1", aws_secret_key);
        var hash2 = hmac.update(policy);
        var signature = hmac.digest(encoding = "base64");

        res.json(200, {
            //            bucket: bucket,
            'key': aws_access_key,
            //           acl: acl,
            //            key: key,
            //           redirect: success_action_redirect,
            //           content_type: content_type,
            'policy': policy,
            'signature': signature
        });
    });

    function str_replace(search, replace, subject, count) {
        var i = 0,
            j = 0,
            temp = '',
            repl = '',
            sl = 0,
            fl = 0,
            f = [].concat(search),
            r = [].concat(replace),
            s = subject,
            ra = Object.prototype.toString.call(r) === '[object Array]',
            sa = Object.prototype.toString.call(s) === '[object Array]';
        s = [].concat(s);
        if (count) {
            this.window[count] = 0;
        }

        for (i = 0, sl = s.length; i < sl; i++) {
            if (s[i] === '') {
                continue;
            }
            for (j = 0, fl = f.length; j < fl; j++) {
                temp = s[i] + '';
                repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
                s[i] = (temp).split(f[j]).join(repl);
                if (count && s[i] !== temp) {
                    this.window[count] += (temp.length - s[i].length) / f[j].length;
                }
            }
        }
        return sa ? s : s[0];
    }






};