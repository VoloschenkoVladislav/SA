import React from 'react';
import { Link } from 'react-router-dom';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class PreferenceAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            problem_id: null,
            problem_name: null,
            expert_id: null,
            expert_name: null,
            alts: [],
            current: null,
            description: null,
            order: []
        };
        this.changeCurrent = this.changeCurrent.bind(this);
        this.swap = this.swap.bind(this);
        this.sendSolution = this.sendSolution.bind(this);
        this.sendUnsaved = this.sendUnsaved.bind(this);
    }

    componentDidMount() {
        let id = this.props.match.params.problem;
        let expert = this.props.match.params.expert;
        let problem = ipcRenderer.sendSync('get-problem-by-id', id);
        let order = ipcRenderer.sendSync('get-unfinished-solution', {expert: this.props.match.params.expert, problem: this.props.match.params.problem, method: 'preference'});
        order = order.map(item => Number(item));
        if (order.length == 0) for (let i = 0; i < problem.alts.length; i += 1) order.push(i);
        this.setState({
            problem_id: id,
            problem_name: problem.name,
            expert_id: expert,
            expert_name: ipcRenderer.sendSync('get-login-by-id', expert),
            alts: problem.alts,
            description: problem.description,
            order: order,
            current: 0
        });
    }

    swap(e) {
        let ind = e.target.value;
        let cur = this.state.current;
        let new_order = this.state.order;
        let buf = new_order[ind];
        new_order[ind] = new_order[cur];
        new_order[cur] = buf;
        this.setState({order: new_order});
    }

    changeCurrent(cur) {
        this.setState({current: cur});
    }

    sendSolution() {
        let solution = this.state.order.join(';');
        ipcRenderer.send('set-solution-by-id', {problem: this.props.match.params.problem, solution: solution, method: 'preference', expert: this.props.match.params.expert});
    }

    sendUnsaved() {
        let solution = this.state.order.join(';');
        ipcRenderer.send('save-unfinished-solution', {problem: this.props.match.params.problem, solution: solution, method: 'preference', expert: this.props.match.params.expert});
    }

    render() {
        let inds = [];
        for (let i = 0; i < this.state.alts.length; i += 1) inds.push(i);
        return(
            <div className="percent-analysis">
                <header>
                    <div className="left-part"></div>
                    <h1>Режим эксперта: метод предпочтений</h1>
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
                        {this.state.order.map(item => {
                            let name = '';
                            if (this.state.current == this.state.order.indexOf(item)) name = 'current';
                            return <li className={name} onClick={e => this.changeCurrent(this.state.order.indexOf(item))}>
                                        <p>{this.state.order.indexOf(item) + 1}: </p>
                                        <p>{this.state.alts[item]}</p>
                                   </li> 
                        })}
                    </ul>
                    <div className="switcher">
                        <p>Выберите новую позицию для альтернативы: </p>
                        <select onChange={this.swap} value={this.state.current}>
                            {inds.map(item => <option value={item}>{item + 1}</option>)}
                        </select>
                    </div>
                </body>
                <footer>
                    <Link to={`/expert/${this.props.match.params.expert}`} onClick={this.sendSolution}>Завершить и отправить</Link>
                    <Link to={`/expert/${this.props.match.params.expert}`} onClick={this.sendUnsaved}>Завершить</Link>
                    <Link to={`/expert/${this.props.match.params.expert}`}>Отменить</Link>
                </footer>
            </div>
        );
    }
}

export default PreferenceAnalysis;