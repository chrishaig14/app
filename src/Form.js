import React from "react";

function coordsToString(coordinates) {
    if (!coordinates) {
        return "";
    }
    return coordinates.latitude + "," + coordinates.longitude;
}

function validatePhone(tel) {
    // some custom validation
    return true;
}

function parseCoordinatesString(str) {
    // Parse coordinates string and return {lat:xxx, long:xxx} if ok. Otherwise, return null
    let t = str.split(",");
    if (t.length !== 2) {
        return null;
    }
    if (isNaN(t[0]) || isNaN(t[1])) {
        return null;
    }

    let lat = parseFloat(t[0]);
    let long = parseFloat(t[1]);
    if (lat <= -90 || lat >= 90 || long <= -180 || long >= 180) {
        return null;
    }
    return {latitude: lat, longitude: long};
}

const categories = ["Comercial", "Residencial", "Mixta"];

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            address: "",
            category: categories[0],
            phone: "",
            name: "",
            coordinatesString: "",
            invalidCoords: false
        };
        this.onTextInputChange = this.onTextInputChange.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps !== this.props) {
            // Update coordinates value if click on map
            this.setState({
                coordinatesString: coordsToString(this.props.coordinates)
            });
        }
    }

    onTextInputChange(e, name) {
        if (name === "phone") {
            if (!validatePhone(e.target.value)) {
                return;
            }
        }
        let t = {};
        t[name] = e.target.value;
        this.setState(t);
    }

    render() {
        return (
            <form className={"Form"} onSubmit={(e) => {
                e.preventDefault();
                let coordinates = parseCoordinatesString(this.state.coordinatesString);
                if (!coordinates) {
                    // Invalid coordinates, cant create new place
                    this.setState({invalidCoords: true});
                    return;
                }
                let data = {
                    address: this.state.address,
                    phone: this.state.phone,
                    category: this.state.category,
                    name: this.state.name,
                    coordinates: coordinates
                };
                this.props.onSubmit(data);
                this.setState({invalidCoords: false});

            }}>
                <div className={"Form-item"}>
                    <label htmlFor={"name"}>Nombre</label>
                    <input id={"name"} required={true} type={"text"} value={this.state.name}
                           onChange={(e) => this.onTextInputChange(e, "name")}/>
                </div>
                <div className={"Form-item"}>
                    <label htmlFor={"address"}>Dirección</label>
                    <input required={true} id={"address"} type={"text"} value={this.state.address}
                           onChange={(e) => this.onTextInputChange(e, "address")}/>
                </div>
                <div className={"Form-item"}>
                    <label htmlFor={"phone"}>Teléfono</label>
                    <input required={true} id={"phone"} type={"text"} value={this.state.phone}
                           onChange={(e) => this.onTextInputChange(e, "phone")}/>
                </div>
                <div className={"Form-item"}>
                    <label htmlFor={"category"}>Categoría</label>
                    <select id={"category"} onChange={e => {
                        this.setState({category: e.target.options[e.target.selectedIndex].value});
                    }}>
                        {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className={"Form-item"}>
                    <label htmlFor={"coordinates"}>Lat. , Long.</label>
                    <input id={"coordinates"}
                           required={true} type={"text"}
                           value={this.state.coordinatesString}
                           onChange={e => {
                               let s = e.target.value;
                               this.setState({coordinatesString: s});
                           }}
                    />
                </div>
                {this.state.invalidCoords ? <div style={{color: "red"}}>Coordenadas inválidas</div> : null}
                <button className={"Form-submit"} type={"submit"}>Agregar</button>
            </form>
        );
    }
}

export default Form;
