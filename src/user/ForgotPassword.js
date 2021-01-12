import axios from 'axios';
import React, {useState} from 'react';
import { useStore } from 'react-redux';
import { Redirect } from 'react-router-dom';

const ForgotPassword = () => {
    
    const [email, setEmail] = useState('')
    const [message,setMessage] = useState('')
    

    const formSubmit= (event) => {
        console.log('submitted')
        axios
            .post('http://localhost:8000/api/forgotpassword',{
                email :email
            },{withCredentials:true})
            .then(response =>{
                console.log(response.data.message)
                localStorage.setItem('resetpassword_token',response.data.token)
                setMessage(response.data.message) 
            })
            .catch( error=>{
                console.log(error)
            })


        event.preventDefault()
    }
    
    const emailChangeHandle = (event) => {
        setEmail(event.target.value)
    }
    
    return (  
        <div className='loginpage'>
            {localStorage.getItem('login_token')?
                    <Redirect to='allusers'/>
                    :
                    <span></span>
                }
            <div className='login'>
                <br/>
    
            <form onSubmit={formSubmit}>
                <label className='label'> Enter email to reset password</label>
                <br/><br/>
                <input
                name='email'
                type='email'
                placeholder='abc@xyz'
                value= {email}
                onChange={emailChangeHandle}
                className='input'
                />
                <br/><br/>

                <button 
                    type="submit"
                    className='login_button'> Submit </button>
                <br/><br/>
    <h5 >{message}</h5>
            </form>
            </div>
        </div>);
    }

 
export default ForgotPassword;