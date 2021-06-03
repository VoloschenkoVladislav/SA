import React from 'react';
import { Link } from 'react-router-dom';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class RankAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            problem_id: null,
            problem_name: null,
            description: '',
            alts: [],
            curAlt: '',
            result: [],
            solved: false
        }
        this.getAnswer = this.getAnswer.bind(this);
        this.complete = this.complete.bind(this);
        this.uncomplete = this.uncomplete.bind(this);
        this.next = this.next.bind(this);
        this.back = this.back.bind(this);
    }

    componentDidMount() {
        let id = this.props.match.params.problem;
        let problem = ipcRenderer.sendSync('get-problem-by-id', id);
        let result = ipcRenderer.sendSync('get-unfinished-solution', {expert: this.props.match.params.expert, problem: this.props.match.params.problem, method: 'rank'});
        if (result.length == 0) {
            result = [];
            for (let i = 0; i < problem.alts.length; i++) result.push('-');
        } 
        this.setState({
            problem_id: id,
            problem_name: problem.name,
            description: problem.description,
            alts: problem.alts,
            curAlt: problem.alts[0],
            result: result
        });
    }

    next() {
        let state = this.state;
        if (state.alts.indexOf(state.curAlt) + 1 != state.alts.length)
            state.curAlt = state.alts[state.alts.indexOf(state.curAlt) + 1];
        this.setState(state);
    }

    back() {
        let state = this.state;
        if (state.alts.indexOf(state.curAlt) != 0)
            state.curAlt = state.alts[state.alts.indexOf(state.curAlt) - 1];
        this.setState(state);
    }

    getAnswer(e, i) {
        

        let state = this.state;
        state.result[this.state.alts.indexOf(this.state.curAlt)] = String(i);
        if (this.state.result.indexOf('-') == -1) state.solved = true;
        this.setState(state);
    }
    
    complete() {
        let solution = this.state.result.join(';');
        ipcRenderer.send('set-solution-by-id', {problem: this.props.match.params.problem, solution: solution, method: 'rank', expert: this.props.match.params.expert});
    }

    uncomplete() {
        let solution = this.state.result.join(';');
        ipcRenderer.send('save-unfinished-solution', {problem: this.props.match.params.problem, solution: solution, method: 'rank', expert: this.props.match.params.expert});
    }

    chooseClass(val) {
        if (this.state.result[this.state.alts.indexOf(this.state.curAlt)] == val) return ' active';
    }

    render() {
        let dialog;
        let next = <button onClick={this.next}>Далее</button>;
        let back = <button onClick={this.back}>Назад</button>;
        if (this.state.alts.indexOf(this.state.curAlt) + 1 == this.state.alts.length) next = '';
        if (this.state.alts.indexOf(this.state.curAlt) == 0) back = '';
        dialog = (
            <div className="rank-analysis__dialog-window">
                <div className="move">
                    <div>
                        {back}
                    </div>
                    <div className="alt">
                        <p>Выберите оценку для альтернативы:</p>
                        <p>{this.state.curAlt}</p>
                    </div>
                    <div>
                        {next}
                    </div>
                </div>
                <div className="rank-analysis__choose-block">
                    <div className={"rank-analysis__alt" + this.chooseClass(1)} onClick={e => this.getAnswer(e, 1)}>1</div>
                    <div className={"rank-analysis__alt" + this.chooseClass(2)} onClick={e => this.getAnswer(e, 2)}>2</div>
                    <div className={"rank-analysis__alt" + this.chooseClass(3)} onClick={e => this.getAnswer(e, 3)}>3</div>
                    <div className={"rank-analysis__alt" + this.chooseClass(4)} onClick={e => this.getAnswer(e, 4)}>4</div>
                    <div className={"rank-analysis__alt" + this.chooseClass(5)} onClick={e => this.getAnswer(e, 5)}>5</div>
                    <div className={"rank-analysis__alt" + this.chooseClass(6)} onClick={e => this.getAnswer(e, 6)}>6</div>
                    <div className={"rank-analysis__alt" + this.chooseClass(7)} onClick={e => this.getAnswer(e, 7)}>7</div>
                    <div className={"rank-analysis__alt" + this.chooseClass(8)} onClick={e => this.getAnswer(e, 8)}>8</div>
                    <div className={"rank-analysis__alt" + this.chooseClass(9)} onClick={e => this.getAnswer(e, 9)}>9</div>
                    <div className={"rank-analysis__alt" + this.chooseClass(10)} onClick={e => this.getAnswer(e, 10)}>10</div>
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
            <div className="rank-analysis">
                <header>
                    <div className="left-part"></div>
                    <h1>Режим эксперта: анализ проблемы</h1>
                    <div className="right-part"></div>
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
                    {dialog}
                </body>
                <footer className="rank-analysis__control">
                    {ready}
                    <Link to={`/expert/${this.props.match.params.expert}`} onClick={this.uncomplete}>Завершить</Link>
                    <Link to={`/expert/${this.props.match.params.expert}`}>Отменить</Link>
                </footer>
            </div>
        );
    }
}

export default RankAnalysis;