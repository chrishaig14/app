import React from "react";

class Form extends React.Component {
    render() {
        return (
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
                    {this.props.coordinates ? <input type={"text"}
                                                     value={
                                                         this.props.coordinates.latitude.toFixed(3) + "," +
                                                         this.props.coordinates.longitude.toFixed(3)}
                        /> :
                        <input type={"text"}/>}
                </div>
                <button type={"submit"}>Agregar</button>
            </form>
        );
    }
}

export default Form;
