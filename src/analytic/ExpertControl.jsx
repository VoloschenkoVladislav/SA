import React from 'react';
import { Link } from 'react-router-dom';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class ExpertControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expert: null,
            experts: [],
            competenceValues: [],
            competences: [],
            edit: false,
            login: '',
            isComp: false,
            competence: 0, 
            newexp: false,
            problem: this.props.match.params.id,
            error: ''
        };


        this.changeExpert = this.changeExpert.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.changeLogin = this.changeLogin.bind(this);
        // this.delete = this.delete.bind(this);
    }

    componentDidMount() {
        let experts = ipcRenderer.sendSync('get-all-experts');
        let expert = null;
        let login = '';
        let competenceValues = [];
        let competences = [];
        if (experts.length != 0) {
            expert = experts[0];
            login = ipcRenderer.sendSync('get-login-by-id', expert);
        }
        for (let item of experts) {
            let competence = ipcRenderer.sendSync('get-competence', {expert: item, problem: this.props.match.params.id});
            if (competence) {
                competenceValues.push(competence);
                competences.push(true);
            }
            else {
                competenceValues.push(0);
                competences.push(false);
            }
        }
        this.setState({experts: experts, expert: expert, login: login, competences: competences, competenceValues: competenceValues, isComp: competences[0], competence: competenceValues[0]});
    }
    
    changeExpert(ind) {
        this.setState({expert: this.state.experts[ind], edit: false, newexp: false, isComp: this.state.competences[ind], competence: this.state.competenceValues[ind], login: ipcRenderer.sendSync('get-login-by-id', this.state.experts[ind])});
    }

    saveChanges() {
        if (this.state.login.length == 0) {
            this.setState({error: 'Поля не должны быть пустыми.'});
            setTimeout(() => this.setState({error: ''}), 2000);
            return;
        }
        if (this.state.newexp) {
            ipcRenderer.sendSync('add-new-expert', {login: this.state.login, problems: []});
        }
        else {
            if (this.state.competence.length == 0) {
                this.setState({error: 'Поля не должны быть пустыми.'});
                setTimeout(() => this.setState({error: ''}), 2000);
                return;
            }
            if (Number(this.state.competence) == NaN) {
                this.setState({error: 'Компетентность выражается в числах.'});
                setTimeout(() => this.setState({error: ''}), 2000);
                return;
            }
            ipcRenderer.sendSync('change-expert', {login: this.state.login, id: this.state.expert});
            let ind = this.state.experts.indexOf(this.state.expert);
            ipcRenderer.sendSync('remove-competence', {expert: this.state.expert, problem: this.props.match.params.id});
            if (this.state.isComp) ipcRenderer.sendSync('set-competence', {expert: this.state.expert, problem: this.props.match.params.id, competence: this.state.competence});
        }
        let experts = ipcRenderer.sendSync('get-all-experts');
        this.setState({edit: false, newexp: false, experts: experts});
        window.location.reload();
    }

    changeLogin(e) {
        this.setState({login: e.target.value});
    }
    
    render() {
        let footer = (
            <footer>
                <Link onClick={e => this.setState({edit: true})}>Редактировать профиль эксперта</Link>
                <Link onClick={e => this.setState({edit: false,  login: '', expert: null, newexp: true})}>Создать профиль эксперта</Link>
            </footer>
        );

        if (this.state.experts.length == 0) {
            footer = (
                <footer>
                    <Link onClick={e => this.setState({edit: false,  login: '', expert: null, newexp: true})}>Создать профиль эксперта</Link>
                </footer>
            );
        }

        let newexp = null;

        if (this.state.edit) {
            footer = (
                <footer>
                    <Link onClick={this.saveChanges}>Сохранить</Link>
                    <Link onClick={e => this.setState({edit: false})}>Отменить</Link>
                    <Link onClick={e => { ipcRenderer.sendSync('delete-expert', this.state.expert); this.setState({edit: false, experts: ipcRenderer.sendSync('get-all-experts')})}}>Удалить</Link>
                </footer>
            );
        }
        else if (this.state.newexp) {
            footer = (
                <footer>
                    <Link onClick={this.saveChanges}>Сохранить</Link>
                    <Link onClick={e => this.setState({edit: false, newexp: false})}>Отменить</Link>
                </footer>
            );
            newexp = (
                <li className='active'><input type="text" onChange={this.changeLogin} placeholder="Логин" /></li>
            );
        }

        if (this.state.error != '') {
            footer = (<footer className="new-problem__links">
                        <p>{this.state.error}</p>
                      </footer>)
        }

        return(
            <div className="expert-control">
                <header>
                    <div className="left-part"><Link to={`/analytic/${this.props.match.params.id}`}>В режим анализа решений</Link></div>
                    <h1>Режим аналитика: управление профилями</h1>
                    <div className="right-part">
                    </div>
                </header>
                <body>
                    <h2>Выберите эксперта:</h2>
                    <ul>
                        {this.state.experts.map(item => {
                            let active = '';
                            if (item == this.state.expert) active = "active";
                            if (this.state.edit && item == this.state.expert)
                                return  <li className="active">
                                            <input type="text" onChange={this.changeLogin} value={this.state.login} />
                                            <div className="competence">
                                                <p>Назначить: </p>
                                                <input type="checkbox" defaultChecked={this.state.isComp} onChange={e => {
                                                    if (this.state.isComp) this.setState({ isComp: false});
                                                    else this.setState({ isComp: true});
                                                }}/>
                                                <p>Компетентность:</p>
                                                <input type="text" disabled={!this.state.isComp} value={this.state.competence} onChange={e => {
                                                    this.setState({ competence: e.target.value });
                                                }}/>
                                            </div>
                                        </li>
                            else
                                return  <li onClick={e => this.changeExpert(this.state.experts.indexOf(item))} className={active}>
                                            <p>{ipcRenderer.sendSync('get-login-by-id', item)}</p>
                                            <p>
                                                Компетентность: {this.state.competenceValues[this.state.experts.indexOf(item)]}
                                            </p>
                                        </li>
                        })}
                        {newexp}
                    </ul>
                </body>
                {footer}
            </div>
        );
    }
}

export default ExpertControl;