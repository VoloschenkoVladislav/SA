import React from 'react';
import { Link } from 'react-router-dom';

class Select extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="select">
                <h1>Выберите режим работы</h1>
                <div className="select__button-block">
                    <Link to="auth" className="select__button">
                        <div className="main-menu__button">
                            <p>Режим эксперта</p>
                        </div>
                        <p className="main-menu__description">
                            Оценка проблемы и существующих решений.
                            Подготовка данных для исследования
                            наилучших решений.
                        </p>
                    </Link>
                    <Link to="/problemlist" className="select__button">
                        <div className="main-menu__button">
                            <p>Режим аналитика</p>
                        </div>
                        <p className="main-menu__description">
                            Создание базы проблем и решений.
                            Управление оценками экспертов.
                            Нахождение наилучшего решения проблемы.
                        </p>
                    </Link>
                </div>
                
            </div>
        );
    }
}

export default Select;