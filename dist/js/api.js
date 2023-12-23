
const API = {
    get_layers: (area) => {
        return new Promise(resolve => {
            var l_uids = window.MAP.l_uids
            fetch('/api/query_features_by_area', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({g_uid:window.localStorage.getItem('g_uid'), l_uids, ...area}),
            }).then((response) => {
                return response.json();
            }).then((data) => {
                resolve(data)
                data.features.forEach((feature, index) => {
                    feature.id = index; // Assign a unique ID based on index
                });
                resolve(data)
            })
        })
    },

    kml_to_postgis: (path, layer_name, table_name) => {
        return new Promise(resolve => {
            fetch('/api/kml_to_postgis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({path: path, layer_name: layer_name, table_name: table_name}),
            }).then((response) => {
                return response.json();
            }).then((data) => {
                resolve(data)
            })
        })
    },

    import_file: (props) => {
        return new Promise(resolve => {
            fetch('/api/import_file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({g_uid: window.localStorage.getItem('g_uid'), ...props}),
            }).then((response) => {
                return response.json();
            }).then((data) => {
                resolve(data)
            })
        })
    },

    get_user: () => {
        return new Promise(resolve => {
            fetch('/api/get_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({g_uid: window.localStorage.getItem('g_uid')}),
            }).then((response) => {
                return response.json();
            }).then((data) => {
                resolve(data)
            })
        })
    },

    get_styles: () => {
        return new Promise(resolve => {
            fetch('/api/get_styles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({g_uid: window.localStorage.getItem('g_uid')}),
            }).then((response) => {
                return response.json();
            }).then((data) => {
                resolve(data)
            })
        })
    },

    get_user_layers: () => {
        return new Promise(resolve => {
            fetch('/api/get_user_layers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({g_uid: window.localStorage.getItem('g_uid')}),
            }).then((response) => {
                return response.json();
            }).then((data) => {
                resolve(data.layers)
            })
        })
    },

    create_new_layer: (name, type) => {
        return new Promise(resolve => {
            fetch('/api/create_new_layer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({g_uid: window.localStorage.getItem('g_uid'), name: name, type: type}),
            }).then((response) => {
                return response.json();
            }).then((data) => {
                resolve(data)
            })
        })
    },

    upload_new_layer: (name, styles, geojson) => {
        return new Promise(resolve => {
            fetch('/api/upload_new_layer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({g_uid: window.localStorage.getItem('g_uid'), name: name, geojson: geojson, styles: styles}),
            }).then((response) => {
                return response.json();
            }).then((data) => {
                resolve(data)
            })
        })
    }, 

    save_styles: (styles) => {
        return new Promise(resolve => {
            fetch('/api/save_styles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                //need to pass g_uid and styles array
                body: JSON.stringify({g_uid: window.localStorage.getItem('g_uid'), styles:styles}),
            }).then((response) => {
                return response.json();
            }).then((data) => {
                resolve(data)
            })
        })
    }
}

export default API;