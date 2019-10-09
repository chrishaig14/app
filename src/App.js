import React from "react";
import "./App.css";
import {loadModules} from "esri-loader";
import Form from "./Form";

function coordsToString(coordinates) {
    if (!coordinates) {
        return "";
    }
    return coordinates.latitude + "," + coordinates.longitude;
}

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
        // Read places (features) from JSON file
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
        // Make feature from data and add it
        let placeFeature = {
            geometry: {type: "point", x: data.coordinates.longitude, y: data.coordinates.latitude},
            attributes: {
                ObjectID: this.state.places.length,
                name: data.name,
                category: data.category,
                address: data.address,
                phone: data.phone,
                coordinates: coordsToString(data.coordinates)
            }
        };

        this.addNewPlace(placeFeature);

        this.setState({newPlaceCoordinates: null});
    }

    addNewPlace(placeFeature) {

        // Add feature to layer

        const options = {css: true};

        loadModules(["esri/Graphic"], options)
            .then(([Graphic]) => {
                this.featureLayer.applyEdits({addFeatures: [Graphic.fromJSON(placeFeature)]})
                    .then(() => {
                        this.setState(state => {
                            state.places.push(placeFeature);
                            return state;
                        });
                    })
                    .catch(err => console.log("Error: ", err));
            })
            .catch(err => {
                console.error("Error: ", err);
            });
    }

    deletePlace(placeFeature) {
        // Delete feature from layer
        this.featureLayer.applyEdits({deleteFeatures: [placeFeature]})
            .then(() => {
                this.setState(state => {
                    state.places = state.places.filter(p => p !== placeFeature);
                    return state;
                });
            })
            .catch(err => console.log("Error: ", err));
    }


    initializeMap() {

        loadModules(["esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/Graphic"], {css: true})
            .then(([Map, MapView, FeatureLayer]) => {

                this.map = new Map({
                    basemap: "streets"
                });

                this.view = new MapView({
                    highlightOptions: {color: "#adea9f"}, // Color for highlighted place
                    container: "viewDiv",
                    map: this.map,
                    center: [-58.46043872833153, -34.58826055711713], // Buenos Aires
                    zoom: 11
                });

                // Set features data
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
                            name: "coordinates",
                            alias: "coordinates",
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
                // Set marker style
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

                // Set popup info
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
                        },
                        {
                            type: "text",
                            text: "<b>Lat., Long.:</b> {coordinates}"
                        }
                    ]
                };

                this.map.layers.add(this.featureLayer);

                this.view.on("click", (e) => {
                    this.view.hitTest(e).then(r => {
                        if (r.results.length > 0) {
                            // If click on existing place: highlight on map and on list
                            let feature = r.results[0].graphic;
                            this.view.whenLayerView(this.featureLayer).then((layerView) => {
                                if (this.highlight) {
                                    this.highlight.remove();
                                }
                                this.highlight = layerView.highlight(feature.attributes.ObjectID);
                                this.setState({selectedPlace: feature.attributes.ObjectID});
                            });
                        } else {
                            // If click outside all places: set coordinates for new place
                            this.setState({newPlaceCoordinates: this.view.toMap({x: e.x, y: e.y})});
                        }
                    });
                });
            })
            .catch(err => {
                console.error("Error: ", err);
            });
    }

    goToPlace(p) {
        // Highlight place and center place in map view
        this.view.whenLayerView(this.featureLayer).then((layerView) => {
            if (this.highlight) {
                this.highlight.remove();
            }
            this.highlight = layerView.highlight(p.attributes.ObjectID);
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
                                <div><b>Categoría:</b> {p.attributes.category}</div>
                                <div><b>Dirección:</b> {p.attributes.address}</div>
                                <div><b>Teléfono:</b> {p.attributes.phone}</div>
                                <div>
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
                </div>
            </div>
        );
    }
}

export default App;
