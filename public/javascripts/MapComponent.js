window.MapComponent = (function (window, document, api) {

    mapboxgl.accessToken = "pk.eyJ1IjoiZGF2aWR5dWhubyIsImEiOiJjampneHdjNG4wODRyM3FybHN0dTF6aXRrIn0.620vyF08CNZESI4i3nBPuA";
    // Holds mousedown state for events. if this
    // flag is active, we move the point on `mousemove`.
    var isDragging;

    // Is the cursor over a point? if this
    // flag is active, we listen for a mousedown event.
    var isCursorOverPoint;

    var coordinates = document.getElementById('coordinates');
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/basic-v9',
        center: [0, 30],
        zoom: 1.4
    });

    var canvas = map.getCanvasContainer();

    var geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-95.278097, 29.309956]
            }
        }]
    };

    /*function mouseDown() {
        if (!isCursorOverPoint) return;

        isDragging = true;

        // Set a cursor indicator
        canvas.style.cursor = 'grab';

        // Mouse events
        map.on('mousemove', onMove);
        map.once('mouseup', onUp);
    }

    function onMove(e) {
        if (!isDragging) return;
        var coords = e.lngLat;

        // Set a UI indicator for dragging.
        canvas.style.cursor = 'grabbing';

        // Update the Point feature in `geojson` coordinates
        // and call setData to the source layer `point` on it.
        geojson.features[0].geometry.coordinates = [coords.lng, coords.lat];
        map.getSource('point1').setData(geojson);
    }

    function onUp(e) {
        if (!isDragging) return;
        var coords = e.lngLat;

        // Print the coordinates of where the point had
        // finished being dragged to on the map.
        coordinates.style.display = 'block';
        coordinates.appendChild(document.createTextNode('Longitude: ' + coords.lng));
        coordinates.appendChild(document.createElement('br'));
        coordinates.appendChild(document.createTextNode('Latitude: ' + coords.lat));
        coordinates.appendChild(document.createElement('br'));
        coordinates.appendChild(document.createElement('hr'));

        // Call the Lyft SDK to retrieve driver ETA at this location 
        api.getApiLyftEta(coords.lat, coords.lng, function(res){
            for (var k in res.eta_estimates) {
                var eta = res.eta_estimates[k];
                coordinates.appendChild(document.createTextNode(eta.display_name + ': ' + eta.eta_seconds + ' sec'));
                coordinates.appendChild(document.createElement('br'));
            }
        });

        canvas.style.cursor = '';
        isDragging = false;

        // Unbind mouse events
        map.off('mousemove', onMove);
    }*/

    map.on('load', function() {
        //const io = require('socket.io');
        const socket = io.connect('http://localhost:3000');
	    socket.on('connection_custom', function (data) {
            fetch(data.url, {
                method: 'get'
            }).then(function(res) {
                res.json().then(function(data){
                    console.log(data);
                    if(data.success === true){
                        console.log(data.users);
                        data.users.forEach(e => {
                            console.log(e.id);
                            geojson.features[0].geometry.coordinates[0] = e.coordLongitude;
                            geojson.features[0].geometry.coordinates[1] = e.coordLatitude;
                            // Add a single point to the map
                            map.addSource("id=" + e.id, {
                                "type": "geojson",
                                "data": geojson
                            });

                            map.addLayer({
                                "id": "id=" + e.id,
                                "type": "circle",
                                "source": "id=" + e.id,
                                "paint": {
                                    "circle-radius": 5,
                                    "circle-color": "#352384",
                                    "circle-stroke-width": 1,
                                    "circle-stroke-color": "#fff"
                                }
                            });
                        })
                    }
                })
            }).catch(function(err) {
                console.log(err);
            });
        });

        // When the cursor enters a feature in the point layer, prepare for dragging.
        /*map.on('mouseenter', 'point1', function() {
            map.setPaintProperty('point1', 'circle-color', '#FF00BF');
            canvas.style.cursor = 'move';
            isCursorOverPoint = true;
            map.dragPan.disable();
        });

        map.on('mouseleave', 'point1', function() {
            map.setPaintProperty('point1', 'circle-color', '#352384');
            canvas.style.cursor = '';
            isCursorOverPoint = false;
            map.dragPan.enable();
        });

        map.on('mousedown', mouseDown);*/
    });
})(window, window.document, window.ApiComponent);