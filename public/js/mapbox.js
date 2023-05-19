/* eslint-disable */

export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoicXFxcXFxd2FxIiwiYSI6ImNsaGRuaHVkOTA5cW8zcW80NWl3MDZlZGcifQ.YYJHyYhfeufVRrK6ljaNyQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/qqqqqqwaq/clhhm6wta01dc01quhjg72c1q',
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // create marker
        const el = document.createElement('div');
        el.className = 'marker';

        // add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        // add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}:${loc.description}</p>`)
            .addTo(map);

        // extends map bounds to include the current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 200,
            left: 100,
            right: 100
        }
    });
}