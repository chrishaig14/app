import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {loadModules} from "esri-loader";
import Form from "./Form";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {places: [], selectedPlace: null};
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
                let template = {title: "{ObjectId}"};
                this.featureLayer.popupTemplate = template;
                this.map.layers.add(this.featureLayer);
                this.view.on("click", (e) => {
                    this.view.hitTest(e).then(r => {
                        console.log("RESULTS HIT: ", r);
                        if (r.results.length > 0) {
                            let feature = r.results[0].graphic;
                            this.view.whenLayerView(this.featureLayer).then((layerView) => {
                                if (this.highlight) {
                                    this.highlight.remove();
                                }
                                this.highlight = layerView.highlight(feature.attributes.ObjectID);
                                this.setState({selectedPlace: feature.attributes.ObjectID});
                                // this.view.goTo(p);
                            });
                        } else {
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
                        }
                    });
                    // let pos = this.view.toMap({x: e.x, y: e.y});
                    // pos = {latitude: pos.latitude, longitude: pos.longitude};
                    // document.getElementById("coordinates").innerText = pos.latitude + " , " + pos.longitude;
                    // var newFeature = {
                    //     geometry: {type: "point", x: pos.longitude, y: pos.latitude},
                    //     attributes: {ObjectID: 2, name: "HELLO"}
                    // };
                    // this.featureLayer.applyEdits({addFeatures: [Graphic.fromJSON(newFeature)]})
                    //     .then(res => {
                    //         this.setState(state => {
                    //             state.places.push(newFeature);
                    //             return state;
                    //         });
                    //     })
                    //     .catch(err => console.log("ERROR: ", err));
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
                <div className={"Main"}>
                    <Form/>
                    <div className={"PlaceList"}>
                        {this.state.places.map(p => <div
                            className={["PlaceItem", this.state.selectedPlace === p.attributes.ObjectID ? "Selected" : null].join(" ")}>
                            <span
                                className={"PlaceCoordinates"}>{p.geometry.x.toFixed(3) + "," + p.geometry.y.toFixed(3)}</span>
                            <button className={"GoToButton"} onClick={() => {
                                let editFeature = p;
                                this.view.whenLayerView(this.featureLayer).then((layerView) => {
                                    if (this.highlight) {
                                        this.highlight.remove();
                                    }
                                    this.highlight = layerView.highlight(editFeature.attributes.ObjectID);
                                    this.setState({selectedPlace: p.attributes.ObjectID});
                                    this.view.goTo(p);
                                });

                            }}>Go to place
                            </button>
                        </div>)}
                    </div>
                </div>
                <div>
                    <div id={"viewDiv"} style={{width: "400px", height: "400px"}}></div>
                    <div id={"coordinates"}></div>
                </div>
            </div>
        );
    }
}

export default App;
