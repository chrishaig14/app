import React from "react";

function coordsToString(coordinates) {
    return coordinates.latitude + "," + coordinates.longitude;
}

const categories = ["Comercial", "Residencial", "Mixta"];

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {address: "", category: categories[0], name: "", coordinates: this.props.coordinates};
        this.onTextInputChange = this.onTextInputChange.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps !== this.props) {
            this.setState({coordinates: this.props.coordinates});
        }
    }

    onTextInputChange(e, name) {
        let t = {};
        t[name] = e.target.value;
        this.setState(t);
    }

    render() {
        return (
            <form className={"Form"} onSubmit={(e) => {
                e.preventDefault();
                this.props.onSubmit(this.state);
            }}>
                <div className={"Form-item"}>
                    <label htmlFor={"address"}>Dirección</label>
                    <input id={"address"} type={"text"} value={this.state.address}
                           onChange={(e) => this.onTextInputChange(e, "address")}/>
                </div>
                <div className={"Form-item"}>
                    <label htmlFor={"name"}>Nombre</label>
                    <input id={"name"} required={true} type={"text"} value={this.state.name}
                           onChange={(e) => this.onTextInputChange(e, "name")}/>
                </div>
                <div className={"Form-item"}>
                    <label htmlFor={"category"}>Categoría</label>
                    <select id={"category"} onChange={e => {
                        this.setState({category: e.target.options[e.target.selectedIndex].value});
                    }}>
                        {categories.map(c => <option value={c}>{c}</option>)}
                    </select>
                </div>
                <div className={"Form-item"}>
                    <label htmlFor={"coordinates"}>Coordenadas</label>
                    <input id={"coordinates"} required={true} type={"text"}
                           value={this.state.coordinates ? coordsToString(this.state.coordinates) : ""}
                    />
                </div>
                <button className={"Form-submit"} type={"submit"}>Agregar</button>
            </form>
        );
    }
}

export default Form;
