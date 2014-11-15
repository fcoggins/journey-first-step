$(document).ready(function () {

var cities = [];
var markers = [];
var iterator = 0;
var map;
var linePath, iterations, best_score, tour_cities, tour_coords, current_score;
var drawAnimationFunction;
var linePaths = [];
var cities_string = "";

google.maps.event.addDomListener(window, 'load', initialize);
get_cities_list(); //populate the cities dropdown 
$("#userinput").on("submit", handleFormSubmit);
$("#drop").on("click", get_cities_data);
$("#clear").on("click", clear);
$("#stop").on("click", stop);



function initialize(){
    // Create an array of styles.
    var styles = [
  //   {
  //   "featureType": "administrative.province",
  //   "elementType": "geometry.stroke",
  //   "stylers": [
  //     { "color": "#bdd4de" }
  //   ]
  // },{
  //   "featureType": "landscape.natural",
  //   "stylers": [
  //     { "color": "#2b3a42" }
  //   ]
  // },{
  //   "featureType": "water",
  //   "stylers": [
  //     { "visibility": "on" },
  //     { "color": "#3f5765" }
  //   ]
  // },{
  //   "featureType": "landscape.natural.terrain",
  //   "elementType": "geometry.stroke",
  //   "stylers": [
  //     { "visibility": "on" },
  //     { "color": "#808080" }
  //   ]
  // },
       {
         featureType: "administrative",
         elementType: "labels",
         stylers: [
           { visibility: "off" }
         ]
       },{
         featureType: "poi",
         elementType: "labels",
         stylers: [
           { visibility: "off" }
         ]
       },{
         featureType: "water",
         elementType: "labels",
         stylers: [
           { visibility: "off" }
         ]
       },{
         featureType: "road",
         elementType: "labels",
         stylers: [
           { visibility: "off" }
         ]
       },{
        featureType: "road",
        stylers: [
            { visibility: "off" }
    ]
  }
  // ,{
  //   "featureType": "landscape.natural.terrain",
  //   "stylers": [
  //     { "visibility": "off" }
  //   ]
  // }
     ];

    // Create a new StyledMapType object, passing it the array of styles,
    // as well as the name to be displayed on the map type control.
    var styledMap = new google.maps.StyledMapType(styles,
        {name: "Styled Map"});

    // Create a map object, and include the MapTypeId to add
    // to the map type control.
            var mapOptions = {
                center: { lat: 38.5, lng: -96},
                zoom: 5,
                //mapTypeId: google.maps.MapTypeId.TERRAIN,
                disableDefaultUI: true,
                draggable: false,
                zoomControl: false,
                scrollwheel: false,
                disableDoubleClickZoom: true,
                mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
                }
            };

    map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);
    linePath = new google.maps.Polyline();

    //Associate the styled map with the MapTypeId and set it to display.
    map.mapTypes.set('map_style', styledMap);
    map.setMapTypeId('map_style');

    //Draw a line on the map. Design decision to draw using google LatLng function
    //but can get this from the database later if needed

    }


function drawLine(tour_coords){

    var lineCoordinates = [];
    linePath.setMap(null);
    for (var i=0; i<tour_coords.length; i++){
        lat1 = tour_coords[i][0];
        long1 = -tour_coords[i][1];
        lineCoordinates.push(
            new google.maps.LatLng(lat1, long1)
        );
    }
    lineCoordinates.push(
            new google.maps.LatLng(tour_coords[0][0], -tour_coords[0][1])
        );
    linePath = new google.maps.Polyline({
            path: lineCoordinates,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
    linePath.setMap(map);
}


function drawNearestNeighbor(tour_coords){
    var tourLength = tour_coords.length;
    var lineCoordinates = [];
    var i=0;
    linePaths = [];
    var drawFunction;
    //$("#stop").disabled = true; //stop button messes up the nearest neighbor
    drawFunction = setInterval(function () {
        j = i + 1;
        lat1 = tour_coords[i][0];
        long1 = -tour_coords[i][1];
        lat2 = tour_coords[j][0];
        long2 = -tour_coords[j][1];
        lineCoordinates = [new google.maps.LatLng(lat1, long1),
            new google.maps.LatLng(lat2, long2)];
        linePath = new google.maps.Polyline({
            path: lineCoordinates,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        linePath.setMap(map);
        linePaths.push(linePath);
        i+=1;
        if (i>tourLength-2){
            clearInterval(drawFunction);
           //close the loop
            lat1 = tour_coords[tourLength - 1][0];
            long1 = -tour_coords[tourLength - 1][1];
            lat2 = tour_coords[0][0];
            long2 = -tour_coords[0][1];
            lineCoordinates = [new google.maps.LatLng(lat1, long1),
                new google.maps.LatLng(lat2, long2)];
            linePath = new google.maps.Polyline({
                path: lineCoordinates,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            linePath.setMap(map);
            linePaths.push(linePath);
        }
    }, 100);
}

function drawAnimation(animation_coords){
    var i=0;
    drawAnimationFunction = setInterval(function () {
        drawLine(animation_coords[i]);
        $('#number').text(i+1);
        $('#score').text(current_score[i]); //here we need to add the current route length
        i+=1;
        if (i>(animation_coords.length - 1)){
            clearInterval(drawAnimationFunction);
            $('#route').text(cities_string);//write the route here
        }
    }, 100);
}

function addMarker() {
          markers.push(new google.maps.Marker({
            position: cities[iterator],
            map: map,
            draggable: false,
            icon: "http://labs.google.com/ridefinder/images/mm_20_gray.png",
            animation: google.maps.Animation.DROP
          }));
          iterator++;
        }

function clear() {
    clearInterval(drawAnimationFunction);//stop the animation running
    $('#number').empty();
    $('#score').empty();
    $('#route').empty();
    linePath.setMap(null);//remove best route from map
    for (var i=0; i<linePaths.length; i++){
        linePaths[i].setMap(null);//remove the individual legs from map(Nearest Neighbor)
    }
}

function stop() {
    clearInterval(drawAnimationFunction);
    drawLine(tour_coords);
    $('#number').text(iterations);
    $('#score').text(best_score);
    $('#route').text(cities_string);
}

function drop() {
  for (var i = 0; i < cities.length; i++) {
    setTimeout(function() {
      addMarker();
    }, i * 10);
  }
}


function handleFormSubmit(evt) {
    evt.preventDefault();
    $.ajax({
        type: "POST",
        url: "/userinput",
        data: $('#userinput').serialize(),
        dataType: "json",
        success: function( data ) {
            linePath.setMap(null);
            for (var i=0; i<linePaths.length; i++){
                    linePaths[i].setMap(null);
                }
            clear();
            var image = data.img_file;
            tour_coords = data.tour_coords;
            var animation_coords = data.animation_coords;
            iterations = data.iterations;
            best_score = -data.best_score.toFixed(0);
            tour_cities = data.tour_cities;

            for (var k=0; k < tour_cities.length; k++){              
                cities_string += tour_cities[k] + ', ';
            }
            current_score = data.current_score;
            for (var j=0; j < current_score.length; j++){
                current_score[j] = -current_score[j].toFixed(0);
            }
            // $('#plot').attr("src", data.img_file);
            if($('#algorithm').val() == 'nearest'){
                drawNearestNeighbor(tour_coords);
            }
            else
            {
                //drawLine(tour_coords);
                drawAnimation(animation_coords);
            }
      }
});
}

function get_cities_data(evt){
    $.ajax({
          type: 'GET',
          url: "/get_cities_data",
          dataType: 'json',
          success: function(data) {
            for (i=0; i< data.length; i++){
                cities.push(new google.maps.LatLng(data[i].lat, -data[i].longitude));
            }
            drop();
          }
        });
}

//populate the cities drop down list in the form
function get_cities_list(){
    $.ajax({
          type: 'GET',
          url: "/get_cities_data",
          dataType: 'json',
          success: function(data) {
            text = "";
            for (i=0; i< data.length; i++){
                text +="<option value='"+ i +"'>"+ data[i].city +"</option>";
            }
            $('#start').html(text);
        }
    });
}

//draw actual road paths





$("#test").on("click", addEncodedPaths);

function addEncodedPaths() {
    var encodedFlightPaths = [
      "_ricG`odaM{mMreYgkMpxWciMfiFk`Jfmo@_oBtpNhdI|bRsjA~gQg}GrsJmwHzbY}cG|pw@_qKjuXuuAped@zxDxetAotCteqAtaZx_mBLzmvAcjL~toAbxD`kjBvgJ|teA|{Bl}d@bwQ~cD|mPpgF~sL~kT|jZ~ka@tuIfzXpbSvxl@zlYfxu@vrg@zg`AjrRxyjAbuT|vp@hgRrofAhji@tbnBpbHreLcOx|]xq@~gY`iGngHt`EzcN~fL~lpAecJzorAozXrgqAgrPtdjAs^h`eCqdCplp@kfHjpVepLlh\\c_Avj\\tMxsy@djCvttBkr@zpxAduN|zi@vrKdtV|kBjid@weB`lm@vbDhyAe`An~l@~|Ct|_AvpKplw@h~Dp_ZfeMhxUpw@|sg@jr@zxgAqpD|d~Af`A|`j@uyDfvnAe}CbfJ_oDrh]_{Pn`@o_FjmICd~`@scFhdy@soDfmdAavE~p~Efx@rd{CbpE`smA`o@nag@boIrkEf|Gtv\\r_Iluq@oGrb`@iGdlwBiCfaiBhu\\l{]jsUdfX|Y~qXhp@`|Vl`PzxP~kGfsOxaJd`Dh}Ujxc@v`Ityl@`zGvjK}Zta[{DhmiBe@`fdBzOxvlAdhMllm@jmM~grBczCjpiAyfjAvreEioGhtx@r`@bfbA@tghAh|Fvlq@vmF`efAo`MhydAaMv{mAwqOtep@__Cvu{@`wDrhqAfmGtyc@nXpjaBxpEnds@jxAjxj@yoGbsa@_wXni[}nChyO{jHbqFsgCbe]yxQ`of@ktYhhl@apQxd`@uoH`xb@{gF|ndClfFfnpApsLll}@h{CvytBusDrea@zQth^z~Mdjt@p_L~ye@mjDlrVjwAjmg@hCnc_@jhM|q\\`gUrx{@hfJp{f@uCnvZrxDhxXzf@ht\\vqNz~[foNxoNdlZzfj@nmToqGvgKbtKjnGdtBc|@tfTbhBvq^jcDfzMuaFvqPifCxc]l`FnnYhhIl`Nr[~yXciGfp[q`SppaAv|Q~sq@u~Abb{CwdCzv`@{b\\`pc@gc_@het@}bF~mi@blArbx@dzNvtz@ftLth\\h`D~iXv~HxvGhwOzhZ|nLnkZnu@tz\\psLtqc@__Jrn]vrG~pq@biDbp]cwL`xOmgPvdUegZfvq@oxFnkYypDdiFqmAjrRx|Tv|p@ldc@byZtcLdw\\hpIn}Jt}VnwCxv]zhJhh^nu]drJdpT~cWrnQt{f@dzbAnl]t}`@huJj]dtLc_DnqHboBrlQfcn@rrSb}\\zlJz}["
];
    for( var i = 0, n = encodedFlightPaths.length;  i < n;  i++ ) {
        addEncodedPath( encodedFlightPaths[i] );
    }
}

function addEncodedPath( encodedPath ) {
    console.log('hello');
    var path = google.maps.geometry.encoding.decodePath( encodedPath );

    var polyline = new google.maps.Polyline({
        path: path,
        strokeColor: "#0000FF",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    polyline.setMap( map );
}


});





