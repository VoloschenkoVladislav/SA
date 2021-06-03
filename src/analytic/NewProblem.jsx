import React from 'react';
import { Link } from 'react-router-dom';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

class NewProblem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {scale: '', title: '', description: '', alts: [{value: '', id: 0}, {value: '', id: 1}], error: ''};
        this.addNewAlt = this.addNewAlt.bind(this);
        this.changeAlt = this.changeAlt.bind(this);
        this.deleteAlt = this.deleteAlt.bind(this);
        this.changeTitle = this.changeTitle.bind(this);
        this.changeDescription = this.changeDescription.bind(this);
        this.saveProblem = this.saveProblem.bind(this);
        this.changeScale = this.changeScale.bind(this);
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

    changeScale(e) {
        let cur_state = this.state;
        cur_state.scale = e.target.value;
        this.setState(cur_state);
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

    saveProblem(ready) {
        let out = {
            name: this.state.title,
            description: this.state.description,
            alts: this.state.alts.map(item => item.value),
            status: ready,
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

        ipcRenderer.send('add-new-problem', out);
        window.location.assign("/problemlist");
    }

    render() {
        let footer = (
            <footer className="new-problem__links">
                <Link onClick={e => this.saveProblem(false)}>Сохранить</Link>
                <Link to="/problemlist"className="right">Отмена</Link>
            </footer>
        );
        if (this.state.error != '') {
            footer =   (<footer className="new-problem__links">
                            <p>{this.state.error}</p>
                        </footer>)
        }
        return(
            <div className="new-problem">
                <header>
                    <div className="left-part"></div>
                    <h1>Режим аналитика: создание задачи</h1>
                    <div className="right-part"><Link to="/select">Выход в меню</Link></div>
                </header>
                <body>
                    <form>
                        <div className="new-problem__input">
                            <label htmlFor="title">Имя проблемы: </label>
                            <input type="text" name="title" onChange={this.changeTitle} value={this.state.title} placeholder="Имя проблемы" />
                        </div>
                        <div className="new-problem__input">
                            <label htmlFor="description">Описание проблемы: </label>
                            <textarea type="text" name="description" onChange={this.changeDescription} value={this.state.description} placeholder="Описание проблемы" ></textarea>
                        </div>
                        <div className="new-problem__input">
                            <label htmlFor="scale">Введите шкалу для метода полных парных сравнений: </label>
                            <textarea type="text" name="scale" onChange={this.changeScale} value={this.state.scale} placeholder="Шкала" ></textarea>
                        </div>
                        <div className="new-problem__alts">
                            <p>Добавьте альтернативы решения:</p>
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
                {footer}
            </div>
        );
    }
}

export default NewProblem;