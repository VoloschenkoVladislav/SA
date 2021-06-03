import React from 'react';
import { Link } from 'react-router-dom';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class ProblemList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            problems: [],
            active: 0,
            isIt: true
        };


        this.changeActive = this.changeActive.bind(this);
    }

    componentDidMount() {
        let problems = ipcRenderer.sendSync('get-all-problems');
        if (problems.length == 0) this.setState({isIt: false});        
        else this.setState({problems: problems});
    }
    
    changeActive(ind) {
        this.setState({active: ind});
    }

    
    render() {
        let body = (
                <body>
                    <h2>Выберите проблему:</h2>
                    <ul>
                        {this.state.problems.map(item => {
                            let classname = '';
                            if (this.state.active == this.state.problems.indexOf(item)) classname = 'active'
                            return <li onClick={e => this.changeActive(this.state.problems.indexOf(item))} className={classname}>{ipcRenderer.sendSync('get-name-by-id', item)}</li>
                        })}
                    </ul>
                </body>
        );
        let link = <Link to={`/analytic/${this.state.problems[this.state.active]}`}>Перейти к проблеме</Link>
        if (this.state.isIt == false) {
            body = (<body>
                        <h2>На данный момент нет ни одной проблемы.</h2>
                    </body>);
            link = '';
        }
        return(
            <div className="expert-control">
                <header>
                    <div className="left-part"></div>
                    <h1>Режим аналитика: выбор проблемы</h1>
                    <div className="right-part">
                        <Link to="select">Выход в меню</Link>
                    </div>
                </header>
                {body}
                <footer>
                    {link}
                    <Link to="/newproblem">Создать новую проблему</Link>
                </footer>
            </div>
        );
    }
}

export default ProblemList;