import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {loadModules} from "esri-loader";
import Form from "./Form";
import fs from "fs";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {places: [], selectedPlace: null, newPlaceCoordinates: null};
        this.map = null;
        this.view = null;
        this.featureLayer = null;
        this.highlight = null;
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.savePlaces = this.savePlaces.bind(this);
    }

    savePlaces() {
        console.log(JSON.stringify(this.state.places));
    }

    onFormSubmit(data) {
        this.addNewPlace(data);
        this.setState({newPlaceCoordinates: null});
    }

    addNewPlace(place) {

        const options = {css: true};

        loadModules(["esri/Graphic"], options)
            .then(([Graphic]) => {
                let pos = place.coordinates;
                document.getElementById("coordinates").innerText = pos.latitude + " , " + pos.longitude;
                var newFeature = {
                    geometry: {type: "point", x: pos.longitude, y: pos.latitude},
                    attributes: {
                        ObjectID: this.state.places.length,
                        name: place.name,
                        category: place.category,
                        address: place.address,
                        phone: place.phone
                    }
                };
                this.featureLayer.applyEdits({addFeatures: [Graphic.fromJSON(newFeature)]})
                    .then(res => {
                        this.setState(state => {
                            state.places.push(newFeature);
                            return state;
                        });
                    })
                    .catch(err => console.log("ERROR: ", err));
            })
            .catch(err => {
                console.error(err);
            });
    }

    componentDidMount() {
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

                this.featureLayer = new FeatureLayer({
                    id: "points",
                    fields: [
                        {
                            name: "ObjectID",
                            alias: "ObjectID",
                            type: "oid"
                        },
                        {
                            name: "name",
                            alias: "name",
                            type: "string"
                        },
                        {
                            name: "category",
                            alias: "category",
                            type: "oid"
                        },
                        {
                            name: "address",
                            alias: "address",
                            type: "string"
                        },
                        {
                            name: "phone",
                            alias: "phone",
                            type: "string"
                        },
                        {
                            name: "type",
                            alias: "Type",
                            type: "string"
                        }],
                    objectIdField: "ObjectID",
                    geometryType: "point",
                    source: []
                });
                let template = {
                    content: [
                        {
                            type: "text",
                            text: "<b>Nombre:</b> {name}"
                        },
                        {
                            type: "text",
                            text: "<b>Dirección</b>: {address}"
                        },
                        {
                            type: "text",
                            text: "<b>Teléfono:</b> {phone}"
                        },
                        {
                            type: "text",
                            text: "<b>Categoría:</b> {category}"
                        }
                    ]
                };
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
                            this.setState({newPlaceCoordinates: this.view.toMap({x: e.x, y: e.y})});
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
                    <div className={"SaveLoadJSON"}>
                        <input type={"file"}/>
                        <a href={"data:application/json;charset=utf8," + encodeURIComponent(JSON.stringify(this.state.places))}
                           download={true}>Guardar</a>
                    </div>
                    {/* Change key to reset form after adding new place*/}
                    <Form key={this.state.places.length} onSubmit={this.onFormSubmit}
                          coordinates={this.state.newPlaceCoordinates}/>
                    <div className={"PlaceList"}>
                        {this.state.places.map(p => <div
                            className={["PlaceItem", this.state.selectedPlace === p.attributes.ObjectID ? "Selected" : null].join(" ")}>
                            <div className={"PlaceName"}>{p.attributes.name}</div>
                            <div className={"PlaceCategory"}>{p.attributes.category}</div>
                            <div className={"PlaceAddress"}>{p.attributes.address}</div>
                            <div className={"PlacePhone"}>{p.attributes.phone}</div>
                            <span
                                className={"PlaceCoordinates"}>{p.geometry.y.toFixed(3) + "," + p.geometry.x.toFixed(3)}</span>
                            <button className={"GoToButton"} onClick={() => {
                                let editFeature = p;
                                console.log(p);
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
                <div className={"Map"}>
                    <div id={"viewDiv"} style={{width: "100%", height: "100%"}}></div>
                    <div id={"coordinates"}></div>
                </div>
            </div>
        );
    }
}

export default App;
