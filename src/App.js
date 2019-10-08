import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {loadModules} from "esri-loader";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {places: []};
        this.map = null;
        this.view = null;
        this.featureLayer = null;
        this.highlight = null;
    }

    componentDidMount() {

// first, we use Dojo's loader to require the map class
        const options = {css: true};

        loadModules(["esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/Graphic"], options)
            .then(([Map, MapView, FeatureLayer, Graphic]) => {
                console.log("MAP: ", Map);

                this.map = new Map({
                    basemap: "streets"
                });

                this.view = new MapView({
                    highlightOptions: {color: "#ff0000"},
                    container: "viewDiv",
                    map: this.map,
                    center: [-118.71511, 34.09042], // longitude, latitude
                    zoom: 11
                });

                var features = [{geometry: {type: "point", x: -20, y: 80}, attributes: {ObjectID: 1, name: "HELLO"}}];
                var graphics = features.map(feature => Graphic.fromJSON(feature));
                this.featureLayer = new FeatureLayer({
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
                this.map.layers.add(this.featureLayer);
                this.view.on("click", (e) => {
                    // console.log("e.x: ", e.x, " e.y: ", e.y);
                    let pos = this.view.toMap({x: e.x, y: e.y});
                    pos = {latitude: pos.latitude, longitude: pos.longitude};
                    document.getElementById("coordinates").innerText = pos.latitude + " , " + pos.longitude;
                    var newFeature = {
                        geometry: {type: "point", x: pos.longitude, y: pos.latitude},
                        attributes: {ObjectID: 2, name: "HELLO"}
                    };
                    this.featureLayer.applyEdits({addFeatures: [Graphic.fromJSON(newFeature)]})
                        .then(res => {
                            this.setState(state => {
                                state.places.push(newFeature);
                                return state;
                            });
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
                <form className={"Form"} onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <div className={"Form-item"}>
                        <label>Dirección</label>
                        <input type={"text"}/>
                    </div>
                    <div className={"Form-item"}>
                        <label>Nombre</label>
                        <input type={"text"}/>
                    </div>
                    <div className={"Form-item"}>
                        <label>Categoría</label>
                        <select>
                            <option value={"Comercial"}>Comercial</option>
                            <option value={"Residencial"}>Residencial</option>
                            <option value={"Mixta"}>Mixta</option>
                        </select>
                    </div>
                    <div className={"Form-item"}>
                        <label>Coordenadas</label>
                        <input type={"text"}/>
                    </div>
                    <button type={"submit"}>Agregar</button>
                </form>
                <div>
                    {this.state.places.map(p => <div
                        className={"Place-item"}>{p.geometry.x + "," + p.geometry.y}
                        <button onClick={() => {
                            let editFeature = p;
                            this.view.whenLayerView(this.featureLayer).then((layerView) => {
                                if (this.highlight) {
                                    this.highlight.remove();
                                }
                                this.highlight = layerView.highlight(editFeature.attributes.ObjectID);
                                this.view.goTo(p);
                            });

                        }}>Go to place
                        </button>
                    </div>)}
                </div>
                <div id={"viewDiv"} style={{width: "400px", height: "400px"}}></div>
                <div id={"coordinates"}></div>
            </div>
        );
    }
}

export default App;
