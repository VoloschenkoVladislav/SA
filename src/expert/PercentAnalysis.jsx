import React from 'react';
import { Link } from 'react-router-dom';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class PercentAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            problem_id: null,
            problem_name: null,
            expert_id: null,
            expert_name: null,
            alts: [],
            description: null,
            solution: [],
            total: null
        };
        this.changePercent = this.changePercent.bind(this);
        this.sendSolution = this.sendSolution.bind(this);
        this.sendUnsaved = this.sendUnsaved.bind(this);
    }

    componentDidMount() {
        let id = this.props.match.params.problem;
        let expert = this.props.match.params.expert;
        let problem = ipcRenderer.sendSync('get-problem-by-id', id);
        let solution = ipcRenderer.sendSync('get-unfinished-solution', {expert: this.props.match.params.expert, problem: this.props.match.params.problem, method: 'percent'});
        if (solution.length == 0) solution = problem.alts.map(() => 0);
        solution = solution.map(item => Number(item))
        this.setState({
            problem_id: id,
            problem_name: problem.name,
            expert_id: expert,
            expert_name: ipcRenderer.sendSync('get-login-by-id', expert),
            alts: problem.alts,
            description: problem.description,
            solution: solution,
            total: solution.reduce((acc, cur) => acc + cur)
        });
    }

    changePercent(shift, ind) {
        let state = this.state;
        if (state.total + shift > 100 || state.solution[ind] + shift < 0) return;
        state.total += shift;
        state.solution[ind] += shift;
        this.setState(state);
    }

    sendSolution() {
        let solution = this.state.solution.join(';');
        ipcRenderer.send('set-solution-by-id', {problem: this.props.match.params.problem, solution: solution, method: 'percent', expert: this.props.match.params.expert});
        window.location.assign(`/expert/${this.props.match.params.expert}`);
    }

    sendUnsaved() {
        let solution = this.state.solution.join(';');
        ipcRenderer.send('save-unfinished-solution', {problem: this.props.match.params.problem, solution: solution, method: 'percent', expert: this.props.match.params.expert});
        window.location.assign(`/expert/${this.props.match.params.expert}`)
    }

    render() {
        let disabled = true;
        if (this.state.total == 100) disabled = false;
        return(
            <div className="percent-analysis">
                <header>
                    <div className="left-part"></div>
                    <h1>Режим эксперта: метод взвешенных оценок</h1>
                    <div className="right-part">
                    </div>
                </header>
                <body>
                    <div className="expert-analysis__problem-description">
                        <div className="name">
                            <h3>Проблема:</h3>
                            <p>{this.state.problem_name}</p>
                        </div>
                        <div className="description">
                            <h3>Описание проблемы:</h3>
                            <p>{this.state.description}</p>
                        </div>
                    </div>
                    <ul>
                        <p><b>Распределите проценты:</b></p>
                        {this.state.alts.map(item => 
                           <li>
                               <div className="alt">
                                    <p>{item}</p>
                                    <p>{this.state.solution[this.state.alts.indexOf(item)]}%</p>
                               </div>
                               <div>
                                    <button onClick={e => this.changePercent(1, this.state.alts.indexOf(item))}>+1</button>
                                    <button onClick={e => this.changePercent(10, this.state.alts.indexOf(item))}>+10</button>
                                    <button onClick={e => this.changePercent(-1, this.state.alts.indexOf(item))}>-1</button>
                                    <button onClick={e => this.changePercent(-10, this.state.alts.indexOf(item))}>-10</button>
                               </div>
                           </li> 
                        )}
                    </ul>
                </body>
                <footer>
                    <p>Набрано в процентах {this.state.total}%/100%</p>
                    <Link disabled={disabled} onClick={this.sendSolution}>Завершить и отправить</Link>
                    <Link onClick={this.sendUnsaved}>Завершить</Link>
                    <Link to={`/expert/${this.props.match.params.expert}`}>Отменить</Link>
                </footer>
            </div>
        );
    }
}

export default PercentAnalysis;