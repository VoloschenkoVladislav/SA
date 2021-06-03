import React from 'react';
import ReactDOM from 'react-dom';
import Auth from './expert/Auth.jsx';
import ExpertMain from './expert/Expert.jsx';
import ExpertAnalysis from './expert/ExpertAnalysis.jsx';
import Analytic from './analytic/Analytic.jsx';
import Select from './Select.jsx';
import EditProblem from './analytic/EditProblem.jsx';
import NewProblem from './analytic/NewProblem.jsx';
import NewExpert from './analytic/NewExpert.jsx';
import ExpertControl from './analytic/ExpertControl.jsx';
import EditExpert from './analytic/EditExpert.jsx';
import PercentAnalysis from './expert/PercentAnalysis.jsx';
import RankAnalysis from './expert/RankAnalysis.jsx';
import PreferenceAnalysis from './expert/PreferenceAnalysis.jsx';
import FullPairAnalysis from './expert/FullPairAnalysis.jsx';
import ProblemList from './analytic/ProblemList.jsx';
import './style/style.css';
import { createBrowserHistory } from 'history';
import { Switch, Route, Redirect, Router } from 'react-router-dom';
const electron = window.require('electron');

const history = createBrowserHistory();

class App extends React.Component {
  render() {
    const { history } = this.props;

    return (
      <div className="App">
        <Switch>
          <Route history={history} path='/select' component={Select} />
          <Route history={history} path='/auth' component={Auth} />
          <Route history={history} path='/expertanalysis/pair/:problem/:expert' component={ExpertAnalysis} />
          <Route history={history} path='/expertanalysis/percent/:problem/:expert' component={PercentAnalysis} />
          <Route history={history} path='/expertanalysis/rank/:problem/:expert' component={RankAnalysis} />
          <Route history={history} path='/expertanalysis/preference/:problem/:expert' component={PreferenceAnalysis} />
          <Route history={history} path='/expertanalysis/fullpair/:problem/:expert' component={FullPairAnalysis} />
          <Route history={history} path='/expert/:id' component={ExpertMain} />
          <Route history={history} path='/analytic/:id' component={Analytic} />
          <Route history={history} path='/newproblem' component={NewProblem} />
          <Route history={history} path='/editproblem/:id' component={EditProblem} />
          <Route history={history} path='/profilecontrol/:id' component={ExpertControl} />
          <Route history={history} path='/newexpert' component={NewExpert} />
          <Route history={history} path='/editexperts/:id/:edit' component={EditExpert} />
          <Route history={history} path='/problemlist' component={ProblemList} />
          <Redirect from='/' to='/select'/>
        </Switch>
      </div>
    );
  }
}

ReactDOM.render((
  <Router history={history}>
    <App />
  </Router>
  ),
  document.getElementById('root')
);