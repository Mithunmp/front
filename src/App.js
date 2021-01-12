//import logo from './logo.svg';
import './App.css';
import Signup from './user/signup'
import Login from './user/login'
import Emailverify from './user/Emailverify'
import Userhome from './user/Userhome'
import {Provider} from 'react-redux'
import store from './user/store'
import AllUsers from './user/allUsers'
import Trial from './user/trial'
//import Resetpassword from './user/resetpassword'
//import axios from 'axios'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  //Link
} from "react-router-dom"
import ForgotPassword from './user/ForgotPassword';
import ResetPassword from './user/ResetPassword';
import CreateUser from './user/CreateUser';
import AddTask from './user/AddTask';


import Logout from './user/logout';
import AllTask from './user/AllTasks';
import UpdateTask from './user/UpdateTask';
import Piechart from './user/PieChart';
import TodaysTask from './user/TodaysTask'
import LeftNav from './user/LeftNav';

function App() {
  return (
    <Provider  store = {store}>
    <div className="App">
      <Router>
        <Switch>
          
      
      <Route exact path = {'/login'} component={Login}/>
      <Route exact path = {'/signup'} component={Signup}/>
      <Route exact path = {'/emailverify'} component={Emailverify}/>
      <Route exact path = {'/userhome'} component={Userhome}/>
      <Route exact path = {'/allusers'} component={AllUsers}/>
      <Route exact path = {'/trial'} component={Trial}/>
      <Route exact path = {'/logout'} component= {Logout}/>
      <Route exact path = {'/forgotpassword'} component= {ForgotPassword}/>
      <Route exact path = {'/resetpassword'} component= {ResetPassword}/>
      <Route exact path = {'/createuser'} component= {CreateUser}/>
      <Route exact path = {'/addtask'} component= {AddTask}/>
      <Route exact path = {'/alltasks'} component= {AllTask}/>
      <Route exact path = {'/updatetask'} component= {UpdateTask}/>
      <Route exact path = {'/piechart'} component= {Piechart}/>
      <Route exact path = {'/todaystask'} component= {TodaysTask}/>
      <Route exact path = {'/leftnav'} component= {LeftNav}/>


      
      <Route path = {'/'} component = {Login} />





      </Switch>
      </Router>
      
    
    </div>
    </Provider>
  )
}

export default App;
