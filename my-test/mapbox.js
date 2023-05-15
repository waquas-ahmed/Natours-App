/* eslint-disable */
console.log('Hello from the client side');
// const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1IjoicXFxcXFxd2FxIiwiYSI6ImNsaGRuaHVkOTA5cW8zcW80NWl3MDZlZGcifQ.YYJHyYhfeufVRrK6ljaNyQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy'
});
