import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {loadModules} from "esri-loader";

class App extends React.Component {
    componentDidMount() {

// first, we use Dojo's loader to require the map class
        const options = {css: true};

        loadModules(["esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/Graphic"], options)
            .then(([Map, MapView, FeatureLayer, Graphic]) => {
                console.log("MAP: ", Map);

                var map = new Map({
                    basemap: "streets"
                });

                var view = new MapView({
                    container: "viewDiv",
                    map: map,
                    center: [-118.71511, 34.09042], // longitude, latitude
                    zoom: 11
                });

                var features = [{geometry: {type: "point", x: -20, y: 80}, attributes: {ObjectID: 1, name: "HELLO"}}];
                var graphics = features.map(feature => Graphic.fromJSON(feature));
                var featureLayer = new FeatureLayer({
                    id: "points",
                    fields: [
                        {
                            name: "ObjectID",
                            alias: "ObjectID",
                            type: "oid"
                        }, {
                            name: "type",
                            alias: "Type",
                            type: "string"
                        }],
                    objectIdField: "ObjectID",
                    geometryType: "point",
                    source: graphics
                });
                map.layers.add(featureLayer);
                view.on("click", (e) => {
                    // console.log("e.x: ", e.x, " e.y: ", e.y);
                    let pos = view.toMap({x: e.x, y: e.y});
                    pos = {latitude: pos.latitude, longitude: pos.longitude};
                    document.getElementById("coordinates").innerText = pos.latitude + " , " + pos.longitude;
                    var newFeature = {
                        geometry: {type: "point", x: pos.longitude, y: pos.latitude},
                        attributes: {ObjectID: 2, name: "HELLO"}
                    };
                    featureLayer.applyEdits({addFeatures: [Graphic.fromJSON(newFeature)]})
                        .then(res => {
                            let l = map.findLayerById("points");
                            console.log(l);
                        })
                        .catch(err => console.log("ERROR: ", err));
                });
            })
            .catch(err => {
                // handle any errors
                console.error(err);
            });
    }

    render() {
        return (
            <div className="App">
                <div id={"viewDiv"} style={{width: "400px", height: "400px"}}></div>
                <div id={"coordinates"}></div>
            </div>
        );
    }
}

export default App;
