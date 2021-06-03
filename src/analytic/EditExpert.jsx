import React from 'react';
import { Link } from 'react-router-dom';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class EditExpert extends React.Component {

    constructor(props) {
        super(props);
        let name = "Новая проблема";
        if (this.props.match.params.id != 0) name = ipcRenderer.sendSync('get-problem-by-id', this.props.match.params.id).name;
        this.state = {
            name: name,
            experts: [],
            actual_experts: [],
            error: '',
            delete: false
        };
        this.changeActual = this.changeActual.bind(this);
        this.changeCompetence = this.changeCompetence.bind(this);
        this.saveExpert = this.saveExpert.bind(this);
        this.isChecked = this.isChecked.bind(this);
        this.delete = this.delete.bind(this);
    }

    componentDidMount() {
        let expert_ids = ipcRenderer.sendSync('get-all-experts');
        let experts = [];
        let actual_experts = expert_ids.map(item => {
            let act_prob = ipcRenderer.sendSync('get-problems-by-expert', item);
            let ind = act_prob.findIndex(item => item.id == this.props.match.params.id);
            if (ind != -1) return {id: act_prob[ind].id, competence: act_prob[ind].competence};  
        });
        actual_experts = actual_experts.filter(item => item != null);
        for (let item of expert_ids) {
            experts.push({name: ipcRenderer.sendSync('get-login-by-id', item), id: item});
        }
        this.setState({experts: experts, actual_experts: actual_experts});
    }

    changeActual(e, id) {
        let act_exp = this.state.actual_experts;
        let ind = this.state.actual_experts.findIndex((item, index, array) => {
            if (item.id == id) return true;
            else return false;
        });
        
        if (ind != -1) act_exp.splice(ind, 1);
        else act_exp.push({id: id, competence: '0'});
        this.setState({actual_experts: act_exp}); 
    }

    changeCompetence(e, id) {
        let act_exp = this.state.actual_experts;
        let ind = this.state.actual_experts.findIndex((item, index, array) => {
            if (item.id == id) return true;
            else return false;
        });

        let new_elem = e.target.value;
        act_exp[ind].competence = new_elem;
        this.setState({actual_experts: act_exp}); 
    }

    saveExpert() {
        // if (this.state.actual_problems.findIndex((item, index, array) => {
        //     if (item.competence.match(/^[0-9]+(\.[0-9]+)?$/) === null) return true;
        //     else return false;
        // }) != -1) { this.setState({error: 'Для ввода компетентности экспертов используйте вещественные числа, используя в качестве разделителя точку.'}); return; }
        
        for (let exp in this.state.experts) {
            let ind = this.state.actual_experts.findIndex(item => item.id == exp);
            if (ind == -1)
                ipcRenderer.send('remove-competence', {expert: Number(exp), problem: Number(this.props.match.params.id)});
            else
                ipcRenderer.send('set-competence', {expert: Number(exp), problem: Number(this.props.match.params.id), competence: Number(this.state.actual_experts[ind].competence)});
        }

        window.location.assign(`/editproblem/${this.props.match.params.id}`);
    }

    isChecked(id) {
        if (this.state.actual_experts.findIndex((item, index, array) => {
            if (item.id == id) return true;
            else return false;
        }) != -1) return true;
        else return false;
    }

    delete() {
        ipcRenderer.sendSync('delete-expert', this.props.match.params.id);
        window.location.assign("/profilecontrol");
    }

    render() {

        let back = `/editproblem/${this.props.match.params.id}`;
        if (this.props.match.params.edit == 0) back = `/newproblem`;

        let linkArea = (<footer className="new-expert__links">
                            <Link onClick={this.saveExpert}>Сохранить</Link>
                            <Link to={back} className="right">Отмена</Link>
                        </footer>);

        if (this.state.delete) {
            linkArea = (<footer className="new-problem__links">
                            <p>Вы уверены, что хотите удалить профиль этого эксперта?</p>
                            <Link onClick={this.delete}>Да</Link>
                            <Link onClick={() => this.setState({delete: false})}>Нет</Link>
                        </footer>);
        }


        return(
            <div className="new-expert">
                <header>
                    <div className="left-part">
                        <Link to={back} className="right">Назад</Link>
                    </div>
                    <h1>Режим аналитика: назначение экспертов</h1>
                    <div className="right-part">
                        <Link to="/select">Выход в меню</Link>
                    </div>
                </header>
                <body>    
                    <form>
                        <div className="new-expert__login">
                            <p>Проблема: {this.state.name}</p>
                        </div>

                        <div className="new-expert__problems">
                            <ul>
                                <li className="new-expert__problem-header">
                                    <p id="task">Эксперты</p>
                                    <p>Компетентность</p>
                                </li>
                                {this.state.experts.map(item => {

                                    let comp;
                                    comp = this.state.actual_experts.find(i => {if (i.id == item.id) return true;});
                                    if (comp === undefined) comp = '';
                                    else comp = comp.competence;


                                    return  <li className="new-expert__problem">
                                                <div className="task">
                                                    <label>{item.name}</label>
                                                    <input type="checkbox" onChange={e => this.changeActual(e, item.id)} defaultChecked={this.isChecked(item.id)}/>
                                                </div>
                                                <input type="text" className="competence" placeholder="Компетентность" value={comp} onChange={e => this.changeCompetence(e, item.id)} disabled={!this.isChecked(item.id)}/>
                                            </li>

                                })}
                            </ul>
                        </div>
                    </form>
                </body>
                {/* <p className="new-expert__errors">{this.state.error}</p> */}
                {linkArea}
            </div>
        );
    }
}

export default EditExpert;