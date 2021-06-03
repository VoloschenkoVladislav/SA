import React from 'react';
import { Link } from 'react-router-dom';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class NewExpert extends React.Component {

    constructor(props) {
        super(props);
        this.state = {login: '', problems: [], actual_problems: [], error: ''};
        this.changeActual = this.changeActual.bind(this);
        this.changeCompetence = this.changeCompetence.bind(this);
        this.saveExpert = this.saveExpert.bind(this);
        this.isChecked = this.isChecked.bind(this);
    }

    componentDidMount() {
        let problem_ids = ipcRenderer.sendSync('get-all-problems');
        let problems = []
        for (let item of problem_ids) {
            problems.push({name: ipcRenderer.sendSync('get-name-by-id', item), id: item});
        }
        this.setState({problems: problems});
    }

    changeActual(e, id) {
        let act_prob = this.state.actual_problems;
        let ind = this.state.actual_problems.findIndex((item, index, array) => {
            if (item.id == id) return true;
            else return false;
        });
        
        if (ind != -1) act_prob.splice(ind, 1);
        else act_prob.push({id: id, competence: '0'});
        this.setState({actual_problems: act_prob}); 
    }

    changeCompetence(e, id) {
        let act_prob = this.state.actual_problems;
        let ind = this.state.actual_problems.findIndex((item, index, array) => {
            if (item.id == id) return true;
            else return false;
        });
        let new_elem = e.target.value;
        act_prob[ind].competence = new_elem;
        this.setState({actual_problems: act_prob}); 
    }

    saveExpert() {
        if (this.state.actual_problems.findIndex((item, index, array) => {
            if (item.competence.match(/^[0-9]+(\.[0-9]+)?$/) === null) return true;
            else return false;
        }) != -1) { this.setState({error: 'Для ввода компетентности экспертов используйте вещественные числа, используя в качестве разделителя точку.'}); return; }
        ipcRenderer.sendSync('add-new-expert', {login: this.state.login, problems: this.state.actual_problems});
        window.location.assign('/analytic');
    }

    isChecked(id) {
        if (this.state.actual_problems.findIndex((item, index, array) => {
            if (item.id == id) return true;
            else return false;
        }) != -1) return true;
        else return false;
    }

    render() {
        return(
            <div className="new-expert">
                <h1>Новый эксперт</h1>
                <form>
                    <label htmlFor="login">Введите новый логин: </label>
                    <input type="text" placeholder="Логин" onChange={e => this.setState({login: e.target.value})} />

                    <div className="new-expert__problems">
                        <ul>
                            {this.state.problems.map(item => {

                                return  <li className="new-expert__problem">
                                            <label>{item.name}</label>
                                            <input type="checkbox" onChange={e => this.changeActual(e, item.id)} defaultChecked={this.isChecked(item.id)}/>
                                            <input type="text" placeholder="Компетентность" onChange={e => this.changeCompetence(e, item.id)} disabled={!this.isChecked(item.id)}/>
                                        </li>

                            })}
                        </ul>
                    </div>
                </form>
                <p className="new-expert__errors">{this.state.error}</p>
                <div className="new-expert__links">
                    <div onClick={this.saveExpert}>Сохранить</div>
                    <Link to="/profilecontrol" className="right">Отмена</Link>
                </div>
            </div>
        );
    }
}

export default NewExpert;