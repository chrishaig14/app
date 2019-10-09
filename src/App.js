import React from "react";
import "./App.css";
import {loadModules} from "esri-loader";
import Form from "./Form";

function makeJsonURI(obj) {
    return "data:application/json;charset=utf8," + encodeURIComponent(JSON.stringify(obj));
}

class App extends React.Component {


    constructor(props) {
        super(props);
        this.state = {places: [], selectedPlace: null, newPlaceCoordinates: null};
        this.map = null;
        this.view = null;
        this.featureLayer = null;
        this.highlight = null;
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.loadPlaces = this.loadPlaces.bind(this);
        this.goToPlace = this.goToPlace.bind(this);
        this.fileInput = React.createRef();
    }

    loadPlaces(e) {
        let fileReader = new FileReader();
        fileReader.onloadend = f => {
            let content = JSON.parse(fileReader.result);
            for (let place of content) {
                this.addNewPlace(place);
            }
        };
        fileReader.readAsText(this.fileInput.current.files[0]);
    }

    onFormSubmit(data) {

        var place = {
            geometry: {type: "point", x: data.coordinates.longitude, y: data.coordinates.latitude},
            attributes: {
                ObjectID: this.state.places.length,
                name: data.name,
                category: data.category,
                address: data.address,
                phone: data.phone
            }
        };

        this.addNewPlace(place);

        this.setState({newPlaceCoordinates: null});
    }

    addNewPlace(newFeature) {

        const options = {css: true};

        loadModules(["esri/Graphic"], options)
            .then(([Graphic]) => {
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

    deletePlace(newFeature) {

        this.featureLayer.applyEdits({deleteFeatures: [newFeature]})
            .then(res => {
                this.setState(state => {
                    state.places = state.places.filter(p => p !== newFeature);
                    return state;
                });
            })
            .catch(err => console.log("ERROR: ", err));
    }


    initializeMap() {
        const options = {css: true};

        loadModules(["esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/Graphic"], options)
            .then(([Map, MapView, FeatureLayer, Graphic]) => {

                this.map = new Map({
                    basemap: "streets"
                });

                this.view = new MapView({
                    highlightOptions: {color: "#adea9f"},
                    container: "viewDiv",
                    map: this.map,
                    center: [-58.46043872833153, -34.58826055711713], // longitude, latitude
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

                this.featureLayer.renderer = {
                    type: "simple",
                    symbol: {
                        type: "simple-marker",
                        size: 10,
                        color: "#555555",
                        outline: {
                            width: 0.5,
                            color: "white"
                        }
                    }
                };

                this.featureLayer.popupTemplate = {
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
                        }
                    });
                });
            })
            .catch(err => {
                // handle any errors
                console.error(err);
            });
    }

    goToPlace(p) {
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
    }

    componentDidMount() {
        this.initializeMap();
    }

    render() {
        return (
            <div className="App">
                <div className={"Main"}>
                    <div className={"SaveLoadJSON"}>
                        <label className={"Button"}>
                            Cargar archivo
                            <input style={{display: "none"}} ref={this.fileInput} type={"file"}
                                   onChange={this.loadPlaces}/>
                        </label>
                        <a class={"Button"} href={makeJsonURI(this.state.places)}
                           download={true}>Guardar</a>
                    </div>
                    {/* Change key to reset form after adding new place*/}
                    <Form key={this.state.places.length} onSubmit={this.onFormSubmit}
                          coordinates={this.state.newPlaceCoordinates}/>
                    <div className={"PlaceList"}>
                        {this.state.places.map(p => <div
                            className={["PlaceItem", this.state.selectedPlace === p.attributes.ObjectID ? "Selected" : null].join(" ")}>
                            <div className={"PlaceName"}><b>Nombre:</b> {p.attributes.name}</div>
                            <div className={"PlaceContent"}>
                                <div className={"PlaceCategory"}><b>Categoría:</b> {p.attributes.category}</div>
                                <div className={"PlaceAddress"}><b>Dirección:</b> {p.attributes.address}</div>
                                <div className={"PlacePhone"}><b>Teléfono:</b> {p.attributes.phone}</div>
                                <div className={"PlaceCoordinates"}>
                                    <b>Coordenadas:</b> {p.geometry.y.toFixed(3) + "," + p.geometry.x.toFixed(3)}
                                </div>
                            </div>
                            <div className={"Buttons"}>
                                <button className={"DeleteButton"} onClick={() => this.deletePlace(p)}>Borrar</button>
                                <button className={"GoToButton"} onClick={() => this.goToPlace(p)}>Ir</button>
                            </div>
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
