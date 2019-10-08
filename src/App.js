import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {loadModules} from "esri-loader";

class App extends React.Component {
    componentDidMount() {

// first, we use Dojo's loader to require the map class
        const options = {css: true};

        loadModules(["esri/Map", "esri/views/MapView"], options)
            .then(([Map, MapView]) => {
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
                view.on("click", (e) => {
                    // console.log("e.x: ", e.x, " e.y: ", e.y);
                    let pos = view.toMap({x: e.x, y: e.y});
                    pos = {latitude: pos.latitude, longitude: pos.longitude};
                    document.getElementById("coordinates").innerText = pos.latitude + " , " + pos.longitude;
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
