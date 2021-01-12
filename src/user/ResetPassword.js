import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';

const ResetPassword = (props) => {
    const [password, setPassword] = useState('')
    const [password_confirmation , setPassword_confirmation] = useState('')
    const [token,setToken] = useState('')
    const [message, setMessage] = useState('')

    useEffect(()=>{
        const params = new URLSearchParams(props.location.search)
       const token = params.get('token')
       setToken(token)
   },[])

    const handlePasswordChange = (event) => {

        setPassword(event.target.value)

    }
    const handlePassword_confirmationChange = (event) => {

        setPassword_confirmation(event.target.value)

    }

    const handleSubmit = (event) => {

        axios
            .post ('http://localhost:8000/api/resetpassword',{
                token : token,
                password : password,
                password_confirmation : password_confirmation
            })
            .then( response => {
                console.log(response)
                setMessage(response.data.message)
            })
            .catch( error => {
                console.log(error.response)
                setMessage(error.response.data.message)
                if(error.response.data.password){
                    setMessage(error.response.data.password)
                }
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
            <form onSubmit = { handleSubmit }>
                <h4 className='login-head'>RESET PASSWORD</h4>
                <label className='label'> Password</label>
                <br/><br/>
                <input type='password'
                        name= 'password'
                        placeholder = 'password@123'
                        value = {password}
                        className='input'
                        onChange = {handlePasswordChange}>
                </input>

                <br/>
                <br/>

                <label className='label'> Confirm Password</label>
                <br/><br/>
                <input type='password'
                        name= 'password_confirmation'
                        placeholder = 'password@123'
                        value = {password_confirmation}
                        className='input'
                        onChange = {handlePassword_confirmationChange}>
                </input>
                <br/><br/>
                <button 
                    type='submit'
                    className='login_button'>SUBMIT</button>
                    <br/><br/>

            </form>
            {message==='Password Reset Successful'?
            
                <Redirect to='/'/>
                :
    <h4 className='error'>{message}</h4>
                    }
                </div>
        </div>
    )
}
export default ResetPassword
