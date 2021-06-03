import React from 'react';
import { Link } from 'react-router-dom';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class FullPairAnalysis extends React.Component {
    constructor(props) {
        super(props);
        let id = this.props.match.params.problem;
        this.state = {
            problem: {id: id, name: ''},
            description: '',
            alts: [],
            curInd: 0,
            result: [],
            solved: false,
            between: 0.5,
            pairs: [[0, 1]],
            scale: 100
        }
        this.getAnswer = this.getAnswer.bind(this);
        this.complete = this.complete.bind(this);
        this.uncomplete = this.uncomplete.bind(this);
        this.next = this.next.bind(this);
        this.back = this.back.bind(this);
    }

    componentDidMount() {
        let problem = ipcRenderer.sendSync('get-problem-by-id', this.state.problem.id);
        let solution = ipcRenderer.sendSync('get-unfinished-solution', {problem: this.state.problem.id, expert: this.props.match.params.expert, method: 'fullpair'});
        let pairs = [];
        let a1 = 0, a2 = 0;
        while (true) {
            if (a2 + 1 == problem.alts.length) {
                if (a1 + 2 == problem.alts.length) break;
                a1 += 1;
                a2 = a1 + 1;
                pairs.push([a1, a2])
            }
            else {
                a2 += 1;
                pairs.push([a1, a2]);
            }
        }
        let result = [];
        if (solution != '') result = solution;
        else result = pairs.map(() => '-');
        this.setState({
            problem: {id: this.state.problem.id, name: problem.name},
            description: problem.description,
            alts: problem.alts,
            result: result,
            pairs: pairs,
            scale: problem.scale
        });
    }

    next() {
        if (this.state.curInd + 1 != this.state.pairs.length) this.setState({curInd: this.state.curInd+1 });
    }

    back() {
        if (this.state.curInd != 0) this.setState({curInd: this.state.curInd-1 });
    }

    getAnswer(i) {
        let substate = this.state;
        substate.result[this.state.curInd] = i;
        let solved = false;
        if (substate.result.indexOf('-') == -1) solved = true;
        this.setState({ result: substate.result, solved: solved });
    }
    
    complete() {
        let result = this.state.result.map(item => item/this.state.scale);
        let solution = this.state.result.join(';');
        solution = String(this.state.alts.length) + ';' + solution;
        ipcRenderer.send('set-solution-by-id', {problem: this.props.match.params.problem, solution: solution, method: 'fullpair', expert: this.props.match.params.expert});
    }

    uncomplete() {
        let solution = this.state.result.join(';');
        ipcRenderer.send('save-unfinished-solution', {expert: this.props.match.params.expert, problem: this.props.match.params.problem, method: 'fullpair', solution: solution});
    }

    render() {
        let dialog;
        let next = <button onClick={this.next}>Далее</button>;
        let back = <button onClick={this.back}>Назад</button>;
        if (this.state.curInd+1 == this.state.pairs.length) next = '';
        if (this.state.curInd == 0) back = '';
        
        let input = (
            <div>
                <p>{`${this.state.scale - this.state.result[this.state.curInd]}/${this.state.scale}`}</p>
                <input type="range" min="0" max={this.state.scale} value={this.state.result[this.state.curInd]} onInput={e => this.getAnswer(e.target.value)} />
                <p>{`${this.state.result[this.state.curInd]}/${this.state.scale}`}</p>
            </div>
        );
        if (this.state.result[this.state.curInd] == '-') input = (
            <div>
                <p>{`-/${this.state.scale}`}</p>
                <input type="range" min="0" max={this.state.scale} value="0" onInput={e => this.getAnswer(e.target.value)} />
                <p>{`-/${this.state.scale}`}</p>
            </div>
        );
        dialog = (
            <div className="expert-analysis__dialog-window">
                <div className="move">
                    <div>
                        {back}
                    </div>
                    <p><b>Выберите наиболее предпочтительную альтернативу:</b></p>
                    <div>
                        {next}
                    </div>
                </div>
                <div className="full-expert-analysis__choose-block">
                    <p>{this.state.alts[this.state.pairs[this.state.curInd][0]]}</p>
                    {input}
                    <p>{this.state.alts[this.state.pairs[this.state.curInd][1]]}</p>
                </div>
            </div>
        )

        let ready = '';
        if (this.state.solved) {
            ready = (
                <Link to={`/expert/${this.props.match.params.expert}`} onClick={this.complete}>Завершить оценивание</Link>
            );
        }
        return(
            <div className="expert-analysis">
                <header>
                    <div className="left-part"></div>
                    <h1>Режим эксперта: анализ проблемы</h1>
                    <div className="right-part"></div>
                </header>
                <body>
                    <div className="expert-analysis__problem-description">
                        <div>
                            <h3>Проблема:</h3>
                            <p>{this.state.problem.name}</p>
                        </div>
                        <div>
                            <h3>Описание проблемы:</h3>
                            <p>{this.state.description}</p>
                        </div>
                    </div>
                    {dialog}
                </body>
                <footer className="expert-analysis__control">
                    {ready}
                    <Link to={`/expert/${this.props.match.params.expert}`} onClick={this.uncomplete}>Завершить</Link>
                    <Link to={`/expert/${this.props.match.params.expert}`}>Отменить оценивание</Link>
                </footer>
            </div>
        );
    }
}

export default FullPairAnalysis;