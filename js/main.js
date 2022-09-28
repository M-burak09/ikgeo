// Alle benodigde variabelen 
let geojson;
let map = L.map('map').setView([51.93,4.24], 11);
let mapFilter = document.getElementById('mapFilter');
map.zoomControl.setPosition('topleft');

// Hier wordt de achtergrondkaart ingeladen
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

// Koppelt de kleuren voor de geojson data
const getColor = (data) => {
    return data > 50 ? '#800026' :
        data > 30  ? '#BD0026' :
        data > 25  ? '#E31A1C' :
        data > 20  ? '#FC4E2A' :
        data > 15   ? '#FD8D3C' :
        data > 10   ? '#FEB24C' :
        data > 5   ? '#FED976' :
        data >= 0  ? '#FFEDA0':
                    '#AAA';
}

// Standaard style waardes geo vlakken
const style_waardes = {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.75
}

// Past de stijl toe voor de 4 dimensie filters
const styles = (feature) =>{
    if(document.getElementById('totaal').checked){
        const totaal = {
            fillColor: getColor(feature.properties.TotaalDiefstalUitWoningSchuurED_106 + feature.properties.VernielingMisdrijfTegenOpenbareOrde_107 + feature.properties.GeweldsEnSeksueleMisdrijven_108),  
        };

        return Object.assign(totaal, style_waardes);
    }

    else if(document.getElementById('diefstal').checked){
        const totaal = {
            fillColor: getColor(feature.properties.TotaalDiefstalUitWoningSchuurED_106),
        };

        return Object.assign(totaal, style_waardes);
    }

    else if(document.getElementById('vernieling').checked){
        const totaal = {
            fillColor: getColor(feature.properties.VernielingMisdrijfTegenOpenbareOrde_107),  
        };

        return Object.assign(totaal, style_waardes);
    } 

    else{
        const totaal = {
            fillColor: getColor(feature.properties.GeweldsEnSeksueleMisdrijven_108),
        };

        return Object.assign(totaal, style_waardes);
    }
}

// Wat er moet gebeuren wanneer je over een buurt beweegt
const highlightFeature = (e) => {
    let layer = e.target;

    layer.setStyle({
        weight: 5,
        color: 'rgba(54, 62, 83, 0.9)',
        dashArray: '',
        fillOpacity: 0.75
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

// Het resetten wanneer je niet meer over een buurt beweegt
const resetHighlight = (e) =>{
    geojson.resetStyle(e.target);
    info.update();
}

// Inzoomen wanneer je klikt op een buurt
const zoomToFeature = (e) => {
    map.fitBounds(e.target.getBounds());
}

// Past de vorige 3 functies toe op de kaart
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// Maakt een div met klasse info aan op de kaart. Dit is de informatiekaartje rechtsboven.
let info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    // Methode waarbij de informatie geupdate wordt gebaseerd op de feature properties
    info.update = function (props) {
        this._div.innerHTML = 
            '<h4 class="center">Rotterdam</h4>' +  (props ? '<b>' +

            '<p class="center">' + props.name + '</p>' +

            '<p class="center kopjes"> Gem. inkomen per inwoner </p><p class="dikgedrukt center">' + 
            props.GemiddeldInkomenPerInwoner_66 * 1000 + ',- </p>' +

            '<p class="center kopjes"> Huurwoning  -  Koopwoning </p> <p class="dikgedrukt center">' + 
            props.HuurwoningenTotaal_41 + '%  -  ' + props.Koopwoningen_40 + '%</p>' + 
             
            '<p class="center kopjes"> Eengezinsw.  -  Meergezinsw. </p> <p class="dikgedrukt center">' + 
            props.PercentageEengezinswoning_36 + '%  -  ' + props.PercentageMeergezinswoning_37 + '%</p>' +

            '<p class="center kopjes"> Totale criminaliteit </p> <p class="dikgedrukt center">' + 
            (props.TotaalDiefstalUitWoningSchuurED_106 + props.VernielingMisdrijfTegenOpenbareOrde_107 + props.GeweldsEnSeksueleMisdrijven_108) + '</p>' +

            '<p class="center kopjes"> Diefs. - Vern. - Gew. </p> <p class="dikgedrukt center">' +
            props.TotaalDiefstalUitWoningSchuurED_106 + ' - ' +
            props.VernielingMisdrijfTegenOpenbareOrde_107 + ' - ' +
            props.GeweldsEnSeksueleMisdrijven_108 + '</p>'
            : '<p> Beweeg met je muis over een wijk </p>');
    };

    info.addTo(map);

// Maakt een legenda aan. Deze is rechtsonder op de kaart te zien.    
let legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 5, 10, 15, 20, 25, 30, 50],
        labels = [];
        div.innerHTML += '<h5> Aantal delicten per 1000 inwoners </h5>'

    // Looped door de kleuren bij de getColor functie om deze aan de legenda toe te voegen
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
};

legend.addTo(map);

// Hier worden de slider filters aangemaakt (in totaal 4) waarbij gebruik gemaakt wordt van noUiSlider. 
noUiSlider.create(slider, {
    start: [10000, 50000],
    tooltips: true,
    connect: true,
    range: {
        'min': 10000,
        'max': 50000
    },
    format: {
        from: function(value) {
                return parseInt(value);
            },
        to: function(value) {
                return parseInt(value);
            }
        }
}).on('slide', function(e){

    // De geojson data die de slider moet filteren. Wanneer de waardes tussen de 2 punten zitten zie je de buurt op de kaart, zo niet dan wordt het verwijderd.
    geojson.eachLayer(function(layer) {
        if((layer.feature.properties.GemiddeldInkomenPerInwoner_66 * 1000)>=parseFloat(e[0])&&(layer.feature.properties.GemiddeldInkomenPerInwoner_66 * 1000)<=parseFloat(e[1])) {
            layer.addTo(map);
        } else{
              map.removeLayer(layer);
        }
    });
});

noUiSlider.create(slider1, {
    start: [0, 100],
    tooltips: true,
    connect: true,
    range: {
        'min': 0,
        'max': 100
    },
    format: {
        from: function(value) {
                return parseInt(value);
            },
        to: function(value) {
                return parseInt(value);
            }
        }
}).on('slide', function(e){

    geojson.eachLayer(function(layer) {
        if(layer.feature.properties.HuurwoningenTotaal_41>=parseFloat(e[0])&&layer.feature.properties.HuurwoningenTotaal_41<=parseFloat(e[1])) {
            layer.addTo(map);
        } else{
              map.removeLayer(layer);
        }
    });
});

noUiSlider.create(slider2, {
    start: [0, 100],
    tooltips: true,
    connect: true,
    range: {
        'min': 0,
        'max': 100
    },
    format: {
        from: function(value) {
                return parseInt(value);
            },
        to: function(value) {
                return parseInt(value);
            }
        }
}).on('slide', function(e){

    geojson.eachLayer(function(layer) {
        if(layer.feature.properties.PercentageMeergezinswoning_37>=parseFloat(e[0])&&layer.feature.properties.PercentageMeergezinswoning_37<=parseFloat(e[1])) {
            layer.addTo(map);
        } else{
              map.removeLayer(layer);
        }
    });
});

noUiSlider.create(slider3, {
    start: [0, 50],
    tooltips: true,
    connect: true,
    range: {
        'min': 0,
        'max': 50
    },
    format: {
        from: function(value) {
                return parseInt(value);
            },
        to: function(value) {
                return parseInt(value);
            }
        }
}).on('slide', function(e){

    geojson.eachLayer(function(layer) {
        let leeftijd = layer.feature.properties.k_0Tot15Jaar_8 + layer.feature.properties.k_15Tot25Jaar_9 + layer.feature.properties.k_25Tot45Jaar_10 + layer.feature.properties.k_45Tot65Jaar_11 + layer.feature.properties.k_65JaarOfOuder_12
        let percentage = (layer.feature.properties.k_0Tot15Jaar_8 + layer.feature.properties.k_15Tot25Jaar_9) * 100
        if(percentage / leeftijd>=parseFloat(e[0]) && percentage / leeftijd<=parseFloat(e[1])) {
            layer.addTo(map);
        } else{
              map.removeLayer(layer);
        }
    });
});

// Functies waarbij de kaart sleepfunctie gestopt wordt wanneer je op de filter-, informatie- of legendaschermpje komt.
let dashboard_elementen = [mapFilter,info.getContainer(),legend.getContainer()]
dashboard_elementen.forEach(function(el)
    {
        el.addEventListener('mouseover', function () {
            map.dragging.disable();
        });
    });

    dashboard_elementen.forEach(function(el)
    {
        el.addEventListener('mouseout', function () {
            map.dragging.enable();
        });
    });

// Hier wordt de geojson data op de kaart getoont en geupdate bij interactie.
const showData = () => {
    geojson = L.geoJSON(rotterdamGeoJSON, {
        style: styles,
        onEachFeature: onEachFeature
    }).addTo(map);
}
const changeData = () => {
    geojson.remove();
    showData();
};

showData();