window.MapComponent = (function (window, document, api) {

    mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2aWR5dWhubyIsImEiOiJjampneHdjNG4wODRyM3FybHN0dTF6aXRrIn0.620vyF08CNZESI4i3nBPuA';

    //variable to store the time of the last selection from the database
    var time = null;

    //arrays for saving event listeners
    var enterListeners = {};
    var leaveListeners = {};
    
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/basic-v9',
        center: [0, 30],
        zoom: 1.4
    });

    var canvas = map.getCanvasContainer();
    canvas.style.cursor = 'default';

    var geojson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [-95.278097, 29.309956]
            }
        }]
    };

    function mouseDown() {
        canvas.style.cursor = '';
    }

    function mouseUp() {
        canvas.style.cursor = 'default';
    }

    map.on('mousedown', mouseDown);
    map.on('mouseup', mouseUp);

    const mouseEnter = function (user) {
        map.setPaintProperty('id=' + user.id, 'circle-color', '#FF00BF');
        canvas.style.cursor = 'pointer';
        isCursorOverPoint = true;
        map.dragPan.disable();
    }

    const mouseLeave = function (user) {
        map.setPaintProperty('id=' + user.id, 'circle-color', '#352384');
        canvas.style.cursor = 'default';
        isCursorOverPoint = false;
        map.dragPan.enable();
    }

    const getDataFromDB = async (data) => {
        const res = await fetch(data.url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( { time: time } ),
        });
        const json = await res.json();
        return json;
    }

    const addPoint = function (user, next) {
        //set coordinates of current user
        geojson.features[0].geometry.coordinates[0] = user.coordLongitude;
        geojson.features[0].geometry.coordinates[1] = user.coordLatitude;

        //add source for current user
        map.addSource('id=' + user.id, {
            'type': 'geojson',
            'data': geojson
        });

        //add point for current user on map
        map.addLayer({
            'id': 'id=' + user.id,
            'type': 'circle',
            'source': 'id=' + user.id,
            'paint': {
                'circle-radius': 5,
                'circle-color': '#352384',
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            }
        });
        
        next(user);
    }

    const removePoint = function (user) {
        map.removeSource('id=' + user.id);
        map.removeLayer('id=' + user.id);
        map.off('mouseenter', 'id=' + user.id, enterListeners[user.id]);
        map.off('mouseleave', 'id=' + user.id, leaveListeners[user.id]);
        delete enterListeners[user.id];
        delete leaveListeners[user.id];
    }

    const setEvents = function (user) {
        //save event listeners
        enterListeners[user.id] = mouseEnter.bind(this, user);
        leaveListeners[user.id] = mouseLeave.bind(this, user);
        // When the cursor enters a feature in the point layer.
        map.on('mouseenter', 'id=' + user.id, enterListeners[user.id]);
        map.on('mouseleave', 'id=' + user.id, leaveListeners[user.id]);
    }

    map.on('load', function() {
        const socket = io.connect('http://localhost:3000');

        //socket for connection with server
	    socket.on('connection_custom', function (data) {
            fetch(data.url, {
                method: 'get',
            }).then(function(res) {
                res.json().then(function(data){
                    time = data.time;
                    if(data.success === true){
                        data.users.forEach(e => {
                            addPoint(e, setEvents);
                        })
                    }
                })
            }).catch(function(err) {
                console.log(err);
            });
        });

        //socket for getting new data (that was added to database)
        socket.on('get_new_data', async (data) => {
            let dataFromDB = await getDataFromDB(data);
            time = dataFromDB.time;
            if(dataFromDB.success === true) {
                dataFromDB.users.forEach(e => {
                    addPoint(e, setEvents);
                })
            }
        })

        //socket for getting chages in database
        socket.on('get_updated_data', async (data) => {
            let dataFromDB = await getDataFromDB(data);
            time = dataFromDB.time;
            if(dataFromDB.success ===true) {
                dataFromDB.users.forEach(e => {
                    removePoint(e);
                    addPoint(e, setEvents);
                })
            }
        })

        //socket for getting data adput deleted users
        socket.on('get_deleted_data', function (data) {
            removePoint(data);
        })
    });
})(window, window.document, window.ApiComponent);