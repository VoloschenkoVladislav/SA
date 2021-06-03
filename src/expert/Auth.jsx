import React from 'react';
import { Link } from 'react-router-dom';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;


class Auth extends React.Component {

    constructor(props) {
        super(props);
        this.state = {wrong: false, login: ''};
        this.login = this.login.bind(this);
    }

    login() {
        let login = this.state.login;
        let ids = ipcRenderer.sendSync('get-all-experts');
        let names = ids.map(item => ipcRenderer.sendSync('get-login-by-id', item));
        let ind_id = names.indexOf(login);
        if (ind_id != -1) window.location.assign(`/expert/${ids[ind_id]}`);
        else this.setState({wrong: true});
    }

    render() {
        let error = <p></p>;
        if (this.state.wrong) error = <p className="error">Эксперта с таким логином не найдено.</p>
        return(
            <div className="auth">
                <div className="auth__form">
                    <div className="auth__head">
                        <h3>Авторизация</h3>
                    </div>
                    <div className="auth__body">
                        <p>Введите ваш логин:</p>
                        <input type="text" onChange={e => this.setState({login: e.target.value})}/>
                        <button onClick={this.login}>Войти</button>
                    </div>
                    <Link to="select">Назад</Link>
                    {error}
                </div>
            </div>
        );
    }
}

export default Auth;