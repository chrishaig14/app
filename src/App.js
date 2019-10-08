import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {loadModules} from "esri-loader";

class App extends React.Component {
    componentDidMount() {

// first, we use Dojo's loader to require the map class
        const options = {css: true};

        loadModules(["esri/views/MapView", "esri/WebMap"], options)
            .then(([MapView, WebMap]) => {
                // then we load a web map from an id
                var webmap = new WebMap({
                    portalItem: { // autocasts as new PortalItem()
                        id: "f2e9b762544945f390ca4ac3671cfa72"
                    }
                });
                // and we show that map in a container w/ id #viewDiv
                var view = new MapView({
                    map: webmap,
                    container: "viewDiv"
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
            </div>
        );
    }
}

export default App;
