import React from 'react';
import { Link } from 'react-router-dom';
import { AnalysMatrix } from '../side/matrixAction.js';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class Analytic extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expert: null,
            problem: this.props.match.params.id,
            method: null,
            status: false,
            experts: [],
            weights: [],
            order: [], 
            ranks: [],
            alts: [],
            delete: false
        };


        this.changeExpert = this.changeExpert.bind(this);
        this.changeMethod = this.changeMethod.bind(this);
        this.changeState = this.changeState.bind(this);
        this.deleteSolve = this.deleteSolve.bind(this);
        this.delete = this.delete.bind(this);
    }


    changeState(expert, method) {
        
        let solution = [];
        let competence = [];
        let fullProblem = ipcRenderer.sendSync('get-problem-by-id', this.props.match.params.id);

        if (expert == 0) {
            let activeExpert = ipcRenderer.sendSync('get-all-experts-by-problem-id', this.props.match.params.id);
            for (let item of activeExpert) {
                solution.push(ipcRenderer.sendSync('get-solution', {problem: this.props.match.params.id, expert: item, method: method}));
                competence.push(ipcRenderer.sendSync('get-expert-by-id', item).competence.find(i => {if (i.problem == this.props.match.params.id) return true;}).competence);
            }
            competence = competence.join(';');
            alert('kekw')
        }
        else {
            solution = [ipcRenderer.sendSync('get-solution', {problem: this.props.match.params.id, expert: expert, method: method})];
            // alert(solution);
            let fullExpert = ipcRenderer.sendSync('get-expert-by-id', expert);
            competence = String(fullExpert.competence.find(item => {if (item.problem == this.props.match.params.id) return true;}).competence);
        }
        
        
        let wideSolution;

        if (solution[0]) {
            switch (method) {
                case 'pair':
                    wideSolution = AnalysMatrix.pair_comp(solution[0]);
                    break;
                case 'rank':
                    wideSolution = AnalysMatrix.rank(solution);
                    break;
                case 'preference':
                    wideSolution = AnalysMatrix.preference(solution);
                    break;
                case 'fullpair':
                    wideSolution = AnalysMatrix.full_pair_comp(solution);
                    break;
                case 'percent':
                    alert([solution, competence]);
                    wideSolution = AnalysMatrix.expert_assess(solution, competence)
                    break;
            }

    
            this.setState({
                expert: expert,
                method: method,
                alts: fullProblem.alts,
                order: wideSolution.order,
                ranks: wideSolution.ranks,
                weights: wideSolution.weights,
                status: true
            });

            return true;
        }
        else return false;
    }


    componentDidMount() {
        
        let id = this.props.match.params.id;
        let problem = ipcRenderer.sendSync('get-problem-by-id', id);
        let experts = ipcRenderer.sendSync('get-all-experts-by-problem-id', id);
        
        if (experts.length == 0) {
            this.setState({
                alts: problem.alts,
                experts: experts,
                status: false
            });
        }
        else {
            let solution = false;
            let method;
            this.setState({ experts: experts });
            for (method of ['pair',
                            'rank',
                            'preference',
                            'fullpair',
                            'percent',]) {
                solution = this.changeState(experts[0], method);
                if (solution) break;
            }
            if (!solution) {
                this.setState({
                    alts: problem.alts,
                    status: false,
                    expert: experts[0],
                    method: method
                });
            }
        }
        
    }

    delete() {
        ipcRenderer.sendSync('delete-problem-by-id', this.props.match.params.id);
        //window.location.assign('/problemlist');
    }


    changeExpert(e) {
        let id_ex = e.target.value;
        let solution = false;
        let method = this.state.method;
        solution = this.changeState(id_ex, method);
        if (!solution) {
            this.setState({
                status: false,
                expert: id_ex,
                method: method
            });
        }
    }

    changeMethod(e) {
        let method = e.target.value;
        let solution;
        if (this.state.experts.length != 0) {
            solution = this.changeState(this.state.expert, method);
        }
        if (!solution) {
            this.setState({
                status: false,
                method: method
            });
        }
    }

    getMethodName(method) {
        if (method == 'pair') return 'Метод парных сравнений';
        else if (method == 'percent') return 'Метод взвешенных оценок';
        else if (method == 'rank') return 'Метод ранга';
        else if (method == 'preference') return 'Метод предпочтений';
        else if (method == 'fullpair') return 'Метод полных парных сравнений';
    }

    deleteSolve() {
        ipcRenderer.sendSync('delete-solution', {expert: this.state.expert, problem: this.state.problem, method: this.state.method});
        window.location.reload();
    }

    render() {
        // alert(this.state.problems);
        let alts;
        let body;
        let status;
        let link = `/editproblem/${this.state.problem}`;

        if (this.state.status) status += "Решена\n";
        else status = "Не решена\n";

        if (this.state.status) {
            alts = (
                <div className="analytic-main__solution">
                    <div className="analytic-main__header-row">
                        <p className="analytic-main__number">№</p>
                        <p className="analytic-main__alts">Альтернативы:</p>
                        <p className="analytic-main__weights">Вес:</p>
                        <p className="analytic-main__ranks">Ранг:</p>
                    </div>
                    {this.state.order.map(item => 
                        (<div className="analytic-main__row">
                            <p className="analytic-main__number">{item+1}.</p>
                            <p className="analytic-main__alts">{this.state.alts[item]}</p>
                            <p className="analytic-main__weights">{this.state.weights[item]}</p>
                            <p className="analytic-main__ranks">{this.state.ranks[item]}</p>
                        </div>)
                    )}
                </div>
            );
        }
        else {
            alts = (
                <div className="analytic-main__solution">
                    {/* <p className="analytic-main__not-solved">Решение не получено. В режиме эксперта вы можете дать оценку альтернативам.</p> */}
                    <div className="analytic-main__header-row">
                        <p className="analytic-main__number">№</p>
                        <p className="analytic-main__alts">Альтернативы:</p>
                        <p className="analytic-main__weights">Вес:</p>
                        <p className="analytic-main__ranks">Ранг:</p>
                    </div>
                    {this.state.alts.map(item => 
                        (<div className="analytic-main__row">
                            <p className="analytic-main__number">{this.state.alts.indexOf(item)+1}.</p>
                            <p className="analytic-main__alts">{item}</p>
                            <p className="analytic-main__weights">-</p>
                            <p className="analytic-main__ranks">-</p>
                        </div>)
                    )}
                </div>
            );
        }
        let problem;
        let expert;
        let edit = '';
        let del = '';
        let method;
        let newOption = '';
        let send = '';
        let profile = <Link to={`/profilecontrol/${this.props.match.params.id}`}>В режим управления экспертами</Link>;

        if (this.state.method != 'pair') newOption = <option value="0">Общее решение</option>;

        problem = <p>{ipcRenderer.sendSync('get-name-by-id', this.props.match.params.id)}</p>;
        
        if (ipcRenderer.sendSync('get-problem-by-id', this.state.problem).status == false) {
            edit = <Link className="analityc-main__delete" to={link}>Редактировать текущую проблему</Link>;
            send = <Link onClick={e => this.setState({send: true})}>Отправить на решение</Link>
        }
        else {
            profile = '';
            status += "Отправлена\n";
        };
        
        if (this.state.experts.length != 0) {
            expert = (<select onChange={this.changeExpert}>
                            {this.state.experts.map(item => {
                                return <option value={item}>{ipcRenderer.sendSync('get-login-by-id', item)}</option>;
                            })}
                            {newOption}
                      </select>);
            method = (<select onChange={this.changeMethod} value={this.state.method}>
                          {['pair', 'preference', 'rank', 'percent', 'fullpair'].map(item => {
                              return <option value={item}>{this.getMethodName(item)}</option>;
                          })}
                      </select>);
            if (this.state.status) del = <Link onClick={this.deleteSolve}>Удалить это решение</Link>;
        }
        else {
            send = '';
            method = '';
            expert = (<p>На данную проблему не назначен ни один эксперт.</p>);
        }
        
        body = (
            <body className="analytic-main__body">
                {alts}
                <div className="analytic-main__selector">
                    <p><b>Проблема:</b></p>
                    {problem}
                    <p><b>Эксперт:</b></p>
                    {expert}
                    <p><b>Метод:</b></p>
                    {method}
                    {/* <p>
                        <b>Статус: </b>
                        <span>{status}</span>
                    </p> */}
                </div>
            </body>
        )

        let footer =  ( <footer>
                            {send}
                            {edit}
                            <Link onClick={e => this.setState({delete: true})}>Удалить проблему</Link>
                        </footer> );

        if (this.state.delete) {
            footer = ( <footer>
                           <p>Вы уверены? Проблема не подлежит восстановлению после удаления.</p>
                           <Link to="/problemlist" onClick={this.delete}>Да</Link>
                           <Link onClick={e => this.setState({delete:  false})}>Нет</Link>
                        </footer> );

        }
        if (this.state.send) {
            footer = (  <footer>
                           <p>Вы уверены? После этого действия нельзя будет вернуться к редактированию проблемы.</p>
                           <Link to="/problemlist" onClick={e => {ipcRenderer.sendSync('save-changes-at-problem-by-id', {id: this.props.match.params.id, status: true}); this.setState({send: false})}}>Да</Link>
                           <Link onClick={e => this.setState({send:  false})}>Нет</Link>
                        </footer> );
        }

        return(
            <div className="analytic-main">
                <header>
                    <div className="left-part">
                        {profile}
                    </div>
                    <h1>Режим аналитика: анализ решений</h1>
                    <div className="right-part">
                        <Link to="/problemlist">К списку проблем</Link>
                    </div>
                </header>

                {body}

                {footer}
            </div>
        );
    }
}

export default Analytic;