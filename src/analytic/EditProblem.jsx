import React from 'react';
import { Link } from 'react-router-dom';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class EditProblem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {title: '', description: '', alts: [{value: '', id: 0}, {value: '', id: 1}], delete: false, send: false, error: ''};
        this.addNewAlt = this.addNewAlt.bind(this);
        this.changeAlt = this.changeAlt.bind(this);
        this.deleteAlt = this.deleteAlt.bind(this);
        this.changeTitle = this.changeTitle.bind(this);
        this.changeDescription = this.changeDescription.bind(this);
        this.saveProblem = this.saveProblem.bind(this);
        this.delete = this.delete.bind(this);
        this.changeScale = this.changeScale.bind(this);
    }

    componentDidMount() {
        let problem = ipcRenderer.sendSync('get-problem-by-id', this.props.match.params.id);
        let alts = problem.alts.map(item => {
            return {value: item, id: problem.alts.indexOf(item)};
        });
        this.setState({
            id: this.props.match.params.id,
            title: problem.name,
            alts: alts,
            description: problem.description,
            name: problem.name,
            scale: problem.scale
        });
    }



    addNewAlt(e) {
        e.preventDefault();
        let state = this.state;
        state.alts.push({value: '', id: state.alts.length});
        this.setState(state);
    }

    deleteAlt(e) {
        e.preventDefault();
        if (this.state.alts.length > 2) {
            let state = this.state;
            state.alts.pop();
            this.setState(state);
        }
            
    }

    changeAlt(e, item) {
        let alts = this.state.alts;
        alts[item].value = e.target.value;
        this.setState({alts: alts});
    }

    changeTitle(e) {
        let cur_state = this.state;
        cur_state.title = e.target.value;
        this.setState(cur_state);
    }

    changeDescription(e) {
        let cur_state = this.state;
        cur_state.description = e.target.value;
        this.setState(cur_state);
    }

    changeScale(e) {
        let cur_state = this.state;
        cur_state.scale = e.target.value;
        this.setState(cur_state);
    }

    saveProblem() {
        let out = {
            id: this.props.match.params.id,
            name: this.state.title,
            description: this.state.description,
            alts: this.state.alts.map(item => item.value),
            scale: this.state.scale
        }
        if (out.name.length == 0 || out.description.length == 0 || out.scale.length == 0 || out.alts.indexOf('') != -1) {
            this.setState({error: "Поля не должны быть пустыми."});
            setTimeout(() => this.setState({error: ''}), 2000)
            return;
        }
        else if (Number(out.scale) % 1 != 0) {
            this.setState({error: "Шкала должна быть целым числом."});
            setTimeout(() => this.setState({error: ''}), 2000)
            return;
        }
        ipcRenderer.sendSync('save-changes-at-problem-by-id', out);
        window.location.assign(`/analytic/${this.props.match.params.id}`);
    }

    delete() {
        ipcRenderer.sendSync('delete-problem-by-id', this.props.match.params.id);
        window.location.assign("/problemlist");
    }

    render() {
        let linkArea = (<footer className="new-problem__links">
                            <Link onClick={e => this.saveProblem()}>Сохранить</Link>
                            <Link onClick={() => this.setState({delete: true})}>Удалить</Link>
                            <Link to={`/analytic/${this.props.match.params.id}`}className="right">Отмена</Link>
                        </footer>);

        if (this.state.delete) {
            linkArea = (<footer className="new-problem__links">
                            <p>Вы уверены, что хотите удалить эту проблему?</p>
                            <Link onClick={this.delete}>Да</Link>
                            <Link onClick={() => this.setState({delete: false})}>Нет</Link>
                        </footer>);
        }


        if (this.state.error != '') {
            linkArea =   (<footer className="new-problem__links">
                            <p>{this.state.error}</p>
                        </footer>)
        }

        return(
            <div className="new-problem">
                <header>
                    <div className="left-part"><Link to={`/editexperts/${this.props.match.params.id}/1`}>Назначить экспертов</Link></div>
                    <h1>Режим аналитика: редактирование проблемы</h1>
                    <div className="right-part"><Link to="/select">Выход в меню</Link></div>
                </header>
                <body>
                    <form>
                        <div className="new-problem__input">
                            <label htmlFor="title">Введите название проблемы: </label>
                            <input type="text" name="title" onChange={this.changeTitle} value={this.state.title} placeholder="Имя проблемы" />
                        </div>
                        <div className="new-problem__input">
                            <label htmlFor="description">Введите описание проблемы: </label>
                            <textarea type="text" name="description" onChange={this.changeDescription} value={this.state.description} placeholder="Описание проблемы" ></textarea>
                        </div>
                        <div className="new-problem__input">
                            <label htmlFor="scale">Введите шкалу для метода полных парных сравнений: </label>
                            <textarea type="text" name="scale" onChange={this.changeScale} value={this.state.scale} placeholder="Шкала" ></textarea>
                        </div>
                        <div className="new-problem__alts">
                            <p>Добавьте/измените альтернативы решения:</p>
                            {this.state.alts.map(
                                item => <div className="new-problem__alt"><p>{item.id + 1}.</p><input type="text" value={item.value} onChange={e => this.changeAlt(e, item.id)} /></div>                               
                            )}
                            <div className="new-problem__buttons">
                                <button onClick={this.addNewAlt} className="new-problem__add-alt">+</button>
                                <button onClick={this.deleteAlt} className="new-problem__del-alt">-</button>
                            </div>
                        </div>
                    </form>
                </body>
                {linkArea}
            </div>
        );
    }
}

export default EditProblem;