import React from 'react';
import { Link } from 'react-router-dom';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class ExpertMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login: ipcRenderer.sendSync('get-login-by-id', this.props.match.params.id),
            problems: [],
            description: '',
            alts: [],
            status: false,
            currentProblem: {id: null, name: null},
            methods: ['pair', 'rank', 'percent', 'preference', 'fullpair'],
            method: 'pair'
        }
        this.changeProblem = this.changeProblem.bind(this);
        this.isSolved = this.isSolved.bind(this);
        this.changeMethod = this.changeMethod.bind(this);
    }

    componentDidMount() {
        let problems = ipcRenderer.sendSync('get-problems-by-expert', this.props.match.params.id);
        problems = problems.map(item => item.id);
        if (problems.length != 0) {
            let problem = ipcRenderer.sendSync('get-problem-by-id', problems[0]);
            let methods = ipcRenderer.sendSync('get-allowed-method-by-expert-and-problem', {expert: this.props.match.params.id, problem: problems[0]});
            let status = false;
            let method;
            if (methods.length == 0) {
                status = true;
                method = '';
            }
            else method = methods[0];
            this.setState({
                problems: problems,
                currentProblem: {id: problems[0], name: problem.name},
                description: problem.description,
                alts: problem.alts,
                status: status, 
                methods: methods,
                method: method
            });

        }
        
    }

    changeProblem(e) {
        let id = e.target.value;
        let problem = ipcRenderer.sendSync('get-problem-by-id', id);
        let methods = ipcRenderer.sendSync('get-allowed-method-by-expert-and-problem', {expert: this.props.match.params.id, problem: id});
        let status = false;
        let method;
        if (methods.length == 0) {
            status = true;
            method = '';
        }
        else method = methods[0];
        this.setState({
            currentProblem: {id: id, name: problem.name},
            description: problem.description,
            alts: problem.alts,
            status: problem.status,
            methods: methods,
            status: status,
            method: method
        });
    }

    isSolved() {
        if (this.state.status) {
            return true;
        }
        else {
            return false;
        }
    }

    getMethodName(method) {
        if (method == 'pair') return 'Метод парных сравнений';
        else if (method == 'percent') return 'Метод взвешенных оценок';
        else if (method == 'rank') return 'Метод ранга';
        else if (method == 'preference') return 'Метод предпочтений';
        else if (method == 'fullpair') return 'Метод полных парных сравнений';
    }

    changeMethod(e) {
        let method = e.target.value;
        this.setState({method: method});
    }

    render() {
        let status = '';
        if (this.state.status == false) status = ' не';
        let ready = '';
        if (this.state.status == false) {
            ready = (<footer>
                        <select onChange={this.changeMethod}>
                            {this.state.methods.map(item => <option value={item}>{this.getMethodName(item)}</option>)}
                        </select>
                        <Link to={`/expertanalysis/${this.state.method}/${this.state.currentProblem.id}/${this.props.match.params.id}`} className="expert-main__start-analysis">
                            Дать оценку проблеме
                        </Link>
                     </footer>);
        }
        let body = <div className="expert-main__body"><p>На данный момент вам не назначено ни одной проблемы.</p></div>;
        if (this.state.problems.length != 0) {
            body = (
                <div>
                    <body className="expert-main__body">
                        <div className="expert-main__problem">
                            <div className="expert-main__problem-selector">
                                <h3>Текущая проблема:</h3>
                                <select name="problem" onChange={this.changeProblem}>
                                    {this.state.problems.map(item => <option value={item}>{ipcRenderer.sendSync('get-problem-by-id', item).name}</option>)}
                                </select>
                            </div>
                            <div className="expert-main__problem-desription">
                                <h3>Описание задачи:</h3>
                                <p>{this.state.description}</p>
                            </div>
                        </div>

                        <div className="expert-main__alts">
                            <h3>Список альтернатив:</h3>
                            <ul>
                                {this.state.alts.map(item => <li>{item}</li>)}
                            </ul>
                        </div>
                    </body>

                    <footer className="expert-main__footer">
                        {/* <p className="expert-main__status">
                            Статус: оценка{status} дана.
                        </p> */}
                        {ready}
                    </footer>
                </div>
            );
        }
        return(
            <div className="expert-main">
                <header>
                    <div className="left-part">
                        <p>Вы авторизованы как: {this.state.login}</p>
                    </div>
                    <h1>Режим эксперта: обзор проблемы</h1>
                    <div className="right-part">
                        <Link to="/select">Выход в меню</Link>
                    </div>
                </header>

                {body}
                
            </div>
        );
    }
}

export default ExpertMain;