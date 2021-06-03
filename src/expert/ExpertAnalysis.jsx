import React from 'react';
import { Link } from 'react-router-dom';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class ExpertAnalysis extends React.Component {
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
            status: false, 
            pairs: [[0, 1]]
        }
        this.getAnswer = this.getAnswer.bind(this);
        this.complete = this.complete.bind(this);
        this.uncomplete = this.uncomplete.bind(this);
        this.next = this.next.bind(this);
        this.back = this.back.bind(this);
        this.chooseClass = this.chooseClass.bind(this);
    }

    componentDidMount() {
        let problem = ipcRenderer.sendSync('get-problem-by-id', this.state.problem.id);
        let solution = ipcRenderer.sendSync('get-unfinished-solution', {problem: this.state.problem.id, expert: this.props.match.params.expert, method: 'pair'});
        let pairs = [];
        let a1 = 0, a2 = 0;
        let status = false;
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
        if (solution.length != 0) result = solution.map(item => {if (item == '-') return null; else return item;});
        else result = pairs.map(() => '-');
        if (result.indexOf('-') == -1) status = true;
        this.setState({
            problem: {id: this.state.problem.id, name: problem.name},
            description: problem.description,
            alts: problem.alts,
            result: result,
            pairs: pairs,
            solved: status
        });
    }

    next() {
        if (this.state.curInd + 1 != this.state.pairs.length) this.setState({curInd: this.state.curInd+1 });
    }

    back() {
        if (this.state.curInd != 0) this.setState({curInd: this.state.curInd-1 });
    }

    getAnswer(e, i) {
        let substate = this.state;
        substate.result[this.state.curInd] = i;
        let solved = false;
        if (substate.result.indexOf('-') == -1) solved = true;
        this.setState({ result: substate.result, solved: solved });
    }
    
    complete() {
        let solution = String(this.state.alts.length) + this.state.result.join('');
        ipcRenderer.send('set-solution-by-id', {problem: this.props.match.params.problem, solution: solution, method: 'pair', expert: this.props.match.params.expert});
    }

    uncomplete() {
        let solution = this.state.result.join(';');
        ipcRenderer.send('save-unfinished-solution', {expert: this.props.match.params.expert, problem: this.props.match.params.problem, method: 'pair', solution: solution}); 
    }

    chooseClass(val) {
        if (this.state.result[this.state.curInd] == val) return ' active';
    }

    render() {
        let dialog;
        let next = <button onClick={this.next}>Далее</button>;
        let back = <button onClick={this.back}>Назад</button>;
        if (this.state.curInd+1 == this.state.pairs.length) next = '';
        if (this.state.curInd == 0) back = '';
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
                <div className="expert-analysis__choose-block">
                    <div className={"expert-analysis__alt" + this.chooseClass(0)} onClick={e => this.getAnswer(e, 0)}>{this.state.alts[this.state.pairs[this.state.curInd][0]]}</div>
                    <div className={"expert-analysis__equal" + this.chooseClass(1)} onClick={e => this.getAnswer(e, 1)}>Альтернативы равноценны</div>
                    <div className={"expert-analysis__alt" + this.chooseClass(2)} onClick={e => this.getAnswer(e, 2)}>{this.state.alts[this.state.pairs[this.state.curInd][1]]}</div>
                </div>
            </div>
        )

        let ready = '';
        if (this.state.solved) {
            ready = (
                <Link to={`/expert/${this.props.match.params.expert}`} onClick={this.complete}>Завершить и отправить</Link>
            );
        }
        return(
            <div className="expert-analysis">
                <header>
                    <div className="left-part"></div>
                    <h1>Режим эксперта: метод парных сравнений</h1>
                    <div className="right-part"></div>
                </header>
                <body>
                    <div className="expert-analysis__problem-description">
                        <div className="name">
                            <h3>Проблема:</h3>
                            <p>{this.state.problem.name}</p>
                        </div>
                        <div className="description">
                            <h3>Описание проблемы:</h3>
                            <p>{this.state.description}</p>
                        </div>
                    </div>
                    {dialog}
                </body>
                <footer className="expert-analysis__control">
                    {ready}
                    <Link to={`/expert/${this.props.match.params.expert}`} onClick={this.uncomplete}>Завершить</Link>
                    <Link to={`/expert/${this.props.match.params.expert}`}>Отменить</Link>
                </footer>
            </div>
        );
    }
}

export default ExpertAnalysis;