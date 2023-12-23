const path = require('path');
const wkx = require('wkx');
const spawn = require('child_process').spawn;
const stripe = require('stripe')('sk_test_51O9CpZIvhTau3vLn4LFQcHOx9x5YkhYPmBkob6SMOc73SSsKcfQcZ0ZucxTBRMi5cVrkC867D6yPtoDAJZFNLvMA00JgQ8EXQU');
const uniqid = require('uniqid');
const xml2json = require('xml2json');
const converter = require("@tmcw/togeojson");
const DOMParser = require("xmldom").DOMParser;


var bounds = {
    x: -95.774704,
    y: 40.61364,
    i: -89.098843,
    j: 35.995683
}

const api = {
    routes: (app, db) => {
        app.get('/app', (req, res ) => {
            res.sendFile(path.join(__dirname + '/dist/app.html'));
        })
        
        app.get('/', (req, res ) => {
            res.sendFile(path.join(__dirname + '/dist/home.html'));
        })

        app.get('/subscribe', (req, res ) => {
            res.sendFile(path.join(__dirname + '/dist/subscribe.html'));
        })

        app.get('/terms-of-service', (req, res ) => {
            res.sendFile(path.join(__dirname + '/dist/home.html'));
        })

        app.get('/privacy-policy', (req, res ) => {
            res.sendFile(path.join(__dirname + '/dist/home.html'));
        })

        app.get('/manifest', (req, res ) => {
            res.sendFile(path.join(__dirname + '/dist/manifest.json'));
        })

        app.get('/NCache', (req, res ) => {
            res.sendFile(path.join(__dirname + '/dist/js/NCache.js'));
        })

        app.get('/robots.txt', (req, res ) => {
            res.sendFile(path.join(__dirname + '/dist/robots.txt'));
        })

        app.get('/sitemap.xml', (req, res ) => {
            res.sendFile(path.join(__dirname + '/dist/sitemap.xml'));
        })

        app.get('/js/:filename', (req, res) => {
            res.sendFile(path.join(__dirname + '/dist/js/' + req.params.filename));
        })
        
        app.get('/js/components/:filename', (req, res) => {
            res.sendFile(path.join(__dirname + '/dist/js/components/' + req.params.filename));
        })

        app.get('/js/Behaviors/:filename', (req, res) => {
            res.sendFile(path.join(__dirname + '/dist/js/Behaviors/' + req.params.filename));
        })

        app.get('/img/:filename', (req, res) => {
            res.headers = {
                'Content-Type': 'image/png',
                'Content-Disposition': 'attachment; filename="image.png"'
            }
            res.sendFile(path.join(__dirname + '/dist/img/' + req.params.filename));
        })

        app.get('/font/:filename', (req, res) => {
            res.sendFile(path.join(__dirname + '/dist/font/' + req.params.filename));
        })

        app.post('/api/query_features_by_area', (req, res) => {
            const {g_uid, l_uids, x, y, i, j} = req.body;
            api.query_features_by_area(db, g_uid, l_uids, x, y, i, j).then((geojson) => {
                res.json(geojson)
            })
        })

        app.post('/api/get_styles', (req, res) => {
            const {g_uid} = req.body;
            api.get_styles(db, g_uid).then((styles) => {
                res.json({styles: styles})
            })
        })

        app.post('/api/save_styles', (req, res) => {
            console.log(req.body)  
            const {g_uid, styles} = req.body;
            api.save_styles(db, g_uid, styles).then((r) => {
                res.json(r)
            })
        })

        app.post('/api/get_user', (req, res) => {
            const {g_uid} = req.body;
            api.check_user_exists(db, g_uid).then((user) => {
                api.get_user_layers(db, g_uid).then((layers) => {
                    user.layers = layers;
                    res.json({user: user})
                })
            })
        })

        app.post('/api/get_user_layers', (req, res) => {
            const {g_uid} = req.body;
            api.get_user_layers(db, g_uid).then((layers) => {
                res.json({layers: layers})
            })
        })

        app.post('/auth/login', (req, res) => {
            const {g_uid} = req.body;
            api.check_user_exists(db, g_uid).then((exists) => {
                if(exists.error){
                    res.json({error: exists.error})
                }
                if(exists == false){
                    api.create_user(db, g_uid).then((created) => {
                        res.json({created: created})
                    })
                }else{
                    res.json({exists: exists})
                }
            })
        })

        app.get('/new_customer/:checkout', (req, res) => {
            stripe.checkout.sessions.retrieve(req.params.checkout).then((session) => {
                api.renew_subscription(db, session.client_reference_id).then((user) => {
                    res.redirect('/app')
                })
            })
        })

        app.post('/api/create_new_layer', (req, res) => {
            const {g_uid, name, type} = req.body;
            api.create_new_layer(db, g_uid, name, type).then((created) => {
                res.json({created: created})
            })
        })

        app.post('/api/upload_new_layer', (req, res) => {
            const {g_uid, name, styles, geojson} = req.body;
            api.create_new_layer(db, g_uid, name).then((created) => {
                var l_uid = created.l_uid;
                api.save_styles(db, styles, g_uid).then((imported) => {
                    api.import_kml_to_postgis(db, g_uid, geojson, l_uid, name).then((code) => {
                        res.json({created: created, code: code})
                    })
                })
            })
        })
    },

    save_styles: (db, styles, g_uid) => {
        return new Promise(resolve => {
            styles.forEach((style, index) => {
                api.check_style_exists(db, g_uid, style.name).then((exists) => {
                    console.log(style)
                    if(!exists){
                        var query = 'INSERT INTO styles (g_uid, s_uid, data, type) VALUES ($1, $2, $3, $4)';
                        var queryValues = [g_uid, style.name, style.data, style.type];
                    }else{
                        var query = `UPDATE styles SET data = $1 WHERE g_uid = $2 AND s_uid = $3;`;
                        var queryValues = [style.data, g_uid, style.name];
                    }
                    db.query(query, queryValues, (err, res) => {
                        if (err) {
                          console.error(err);
                        }
                    });
                })
            })
            resolve({success: true})
        })
    },

    get_styles: (db, g_uid) => {
        return new Promise(resolve => {
            const query = `SELECT * FROM styles WHERE g_uid = $1;`;
            db.query(query, [g_uid], (err, res) => {
                if (err) {
                  console.error(err);
                } else {
                    if(res.rows.length > 0){
                        resolve(res.rows)
                    }else{
                        resolve(false);
                    }
                }
            });
        })
    },

    query_features_by_area: (db, g_uid, l_uids, x, y, i, j) => {
        return new Promise(resolve => {
            var query = `SELECT * FROM master_data WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326) AND l_uid = ANY($5);`;
            var p = [x, y, i, j, l_uids]
            db.query(query, p, (err, res) => {
                if (err) {
                  console.error(err);
                } else {
                    var geojson = {
                        type: "FeatureCollection",
                        features: []
                    }
                    for(var i = 0 ; i < res.rows.length; i++){
                        var geometryData = res.rows[i].geom;
                        var geometry = wkx.Geometry.parse(new Buffer.from(geometryData, 'hex'));
                        var feature = {
                            type: "Feature",
                            properties: {
                                id: res.rows[i].id,
                                s_uid: (res.rows[i].s_uid == null) ? res.rows[i].l_uid : res.rows[i].s_uid,
                                description: res.rows[i].description,
                            },
                            parent_layer: res.rows[i].l_uid,
                            geometry: geometry.toGeoJSON()
                        }
                        geojson.features.push(feature)
                    }
                    console.log("YO")
                    resolve(geojson)
                }
            });
        })
    },
        
    import_kml_to_postgis: (db, g_uid, geojson, l_uid, layer_name) => {
        return new Promise(resolve => {
            var d = null;

            geojson.features.forEach((feature, index) => {
                if(feature.geometry.type == 'LineString'){
                    feature.geometry.coordinates.forEach((coordinate, index) => {
                        feature.geometry.coordinates[index] = new wkx.Point(coordinate[0], coordinate[1]);
                    })
                    var geometry = new wkx.LineString(feature.geometry.coordinates).toWkt();
                }else if(feature.geometry.type == 'Point'){
                    var geometry = new wkx.Point(feature.geometry.coordinates[0], feature.geometry.coordinates[1]).toWkt();
                }else if(feature.geometry.type == 'Polygon'){
                    feature.geometry.coordinates.forEach((coordinate, index) => {
                        feature.geometry.coordinates[index].forEach((coordinate, index) => {
                            feature.geometry.coordinates[index] = new wkx.Point(coordinate[0], coordinate[1]);
                        }
                    )})
                    var geometry = new wkx.Polygon(feature.geometry.coordinates).toWkt();
                }

                var query = 'INSERT INTO master_data (geom, properties, s_uid, l_uid, type, g_uid) VALUES (ST_GeomFromText($1, 4326), $2, $3, $4, $5, $6)';
                var s_uid = (feature.properties.styleUrl == undefined) ? l_uid : feature.properties.styleUrl.slice(1);
                const queryValues = [geometry, feature.properties, s_uid, l_uid, feature.geometry.type, g_uid];
                db.query(query, queryValues, (err, res) => {
                    if (err) {
                      console.error(err);
                    }
                })
            })
        })
    },

    check_user_exists: (db, g_uid) => {
        return new Promise(resolve => {
            const query = `SELECT * FROM users WHERE g_uid = $1;`;
            if(g_uid == undefined || g_uid == null){
                resolve({error: 'no g_uid provided'})
            }
            db.query(query, [g_uid], (err, res) => {
                if (err) {
                  console.error(err);
                } else {
                    if(res.rows.length > 0){
                        resolve(res.rows[0])
                    }else{
                        resolve(false)
                    }
                }
            });
        })
    },

    check_style_exists: (db, g_uid, s_uid) => {
        return new Promise(resolve => {
            const query = `SELECT * FROM styles WHERE g_uid = $1 AND s_uid = $2;`;
            db.query(query, [g_uid, s_uid], (err, res) => {
                if (err) {
                  console.error(err);
                } else {
                    if(res.rows.length > 0){
                        resolve(true)
                    }else{
                        resolve(false)
                    }
                }
            });
        })
    },

    create_user: (db, g_uid) => {
        return new Promise(resolve => {
            const query = `INSERT INTO users (g_uid) VALUES ($1);`;
            db.query(query, [g_uid], (err, res) => {
                if (err) {
                  console.error(err);
                } else {
                    resolve(true)
                }
            });
        })
    },

    renew_subscription: (db, g_uid) => {
        return new Promise(resolve => {
            //set subcription to 1 where user = g_uid and set expiration to 1 month from now
           var query = `UPDATE users SET subscription = 1, expiration = NOW() + INTERVAL '1 month' WHERE g_uid = $1;`;
            db.query(query, [g_uid], (err, res) => {
                if (err) {
                  console.error(err);
                } else {
                    resolve(true)
                }
            });
        })
    },

    get_user_layers: (db, g_uid) => {
        return new Promise(resolve => {
            const query = `SELECT * FROM layers WHERE owner_g_uid = $1;`;
            db.query(query, [g_uid], (err, res) => {
                if (err) {
                  console.error(err);
                } else {
                    if(res.rows.length > 0){
                        resolve(res.rows)
                    }else{
                        resolve(false)
                    }
                }
            });
        })
    },

    create_new_layer: (db, g_uid, layer_name, type) => {
        type = (typeof type == 'undefined' || type == null) ? 'default' : type;
        return new Promise(resolve => {
            const query = `INSERT INTO layers (owner_g_uid, name, properties, l_uid) VALUES ($1, $2, $3, $4) RETURNING *;`;
            var l_uid = uniqid()
            db.query(query, [g_uid, layer_name, type, l_uid], (err, res) => {
                if (err) {
                  console.error(err);
                } else {
                    resolve(res.rows[0])
                }
            });
        })
    }
}

module.exports = api;