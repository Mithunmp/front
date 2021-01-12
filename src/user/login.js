import React, { useState } from 'react';
import axios from 'axios'
//import {Redirect} from 'react-router-dom'
import {useSelector, useDispatch } from 'react-redux'
import {loggedin} from './actions/loggedin' 
import {getcurrentuser} from './actions/getCurrentUserAction'
import {isAdmin} from './actions/isAdminAction'
// import store from './store'



import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
  } from "react-router-dom"
import getCurrentUserReducer from './reducers/getCurrentUserReducer';

  

const Login = (props) => {
    
    const [email,setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error,setError] = useState('')
    

    const logged_in = useSelector(state => state.loggedinreducer.logged_in)
    const data = useSelector(state => state.getCurrentUserReducer.user)
    const dispatch = useDispatch()    
    

    const onChangeEmail = (event) => {
        const email = event.target.value
        setEmail(email)
    }

    const onChangePassword = (event) => {
        const password = event.target.value
        setPassword(password)
    }
    

    const formSubmit = (event) =>{
       

        axios
            .post("http://localhost:8000/api/login",
            {
                
                email : email ,
                password : password
                
            })

            .then(response => {
                setError(response.data.error)   

                if(response.data.login_token){
                    localStorage.setItem('login_token',response.data.login_token);
                    dispatch(loggedin())
                    if (email == 'admin@xy.com'){
                        dispatch(isAdmin())
                    }
                    
                    const data = response.data.user 
                    dispatch(getcurrentuser(data))
                    
                       
                }
            })
            .catch(error => {
                setError(error.response.data.error)
            })
        
        event.preventDefault()
    }
    
        
    return ( 
            <div className='loginpage'>
                {localStorage.getItem('login_token')?
                    <Redirect to='allusers'/>
                    :
                    <span></span>
                }

            <div className='login'>
            
                
                <form onSubmit={formSubmit}>
               
                 <div className='login-head'>LOGIN</div>   
                
                    <label className='label'>EMAIL </label><br/><br/>
                    <input className='input'
                    type="email"
                    name="email"
                    value={email}
                    placeholder="abc@xyz"
                    onChange={onChangeEmail}
                    maxlength="256"
                    required/>
                    <br/><br/><br/>

                    <label className='label' >PASSWORD </label><br/><br/>
                    <input className='input'
                    type='password'
                    name="password"
                    value={password}
                    placeholder="pass@12345"
                    onChange={onChangePassword}
                    maxlength="256"
                    required/>
                    
                    <br/><br/><br/>

                    <button className='login_button'
                    type="submit">
                        Submit</button>
                        <br/>
                        <div className='test'>   
                        <br/>    
                        <h4 className='error'>{error}</h4> 
                    <Link className='link'to='/signup'>
                    Signup 
                    </Link>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    
                    <Link className='link' to='/forgotpassword'>
                    Forgot Password
                    </Link>
                    
                    </div>

                </form>

    

        {logged_in?props.history.push('/allusers'):<h1></h1>}

        
        
            </div>
            </div>
         );
    }

 
export default Login