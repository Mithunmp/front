import axios from 'axios';
import React, { useState } from 'react';
import {Link, Redirect} from 'react-router-dom'
import LeftNav from './LeftNav';

const CreateUser = () => {
    
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] =useState('')
    const [password_confirmation, setPassword_confirmation] = useState('')
    const permission = (localStorage.getItem('isLogged')? (localStorage.getItem('isAdmin')?true:false) : false)
    const [message,setMessage] = useState('')
    const handleNameChange = (event) => {
        setName(event.target.value)
    }

    const handleEmailChange = (event) => {
        setEmail(event.target.value)
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const handlePassword_confirmationChange =(event) => {
        setPassword_confirmation(event.target.value)
    }

    const handleSubmit = (event) =>{
        
        axios 
            .post('http://localhost:8000/api/createuser',{
                name : name , 
                email : email,
                password : password , 
                password_confirmation : password_confirmation,
                token : localStorage.getItem('login_token')
            },{withCredentials : true})
            .then( response => {
                console.log(response.data.message)
                setMessage(response.data.message)
            })
            .catch(error => {
                console.log(error.response.data)
                if(error.response.data.password){
                    setMessage(error.response.data.password)
                }
                else
                setMessage(error.response.data.message)
            })

            event.preventDefault()
        }
    

    

    return (
        <div>
            {permission?
            <div>
             <div className='nav'>
             <h2>USER MANAGEMENT</h2>
             {localStorage.getItem('isAdmin')?<div>
             
         </div>:<span></span>}
         <Link className='navlogout' to='/logout'>
                 <span >logout </span>
             </Link>  
             </div>
         <LeftNav/>
            
            <div className='login'>
            <form  onSubmit={handleSubmit}>
            <br/>
                <span className='login-head'>Create User</span>
                <br/><br/>
                <label className='label'> Name</label>
                <br/>
                <input
                name='name'
                type='text'
                placeholder='Enter name'
                value={name}
                onChange={handleNameChange}
                className='input'
                required
                maxLength='256'
                />
                <br/><br/><br/>

                <label className='label'>Email</label>
                <br/>
                <input
                name='email'
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={handleEmailChange}
                className='input'
                required
                maxLength='256'
                />
                <br/><br/><br/>

                <label className='label'>Password</label>
                <br/>
                <input
                name='password'
                type='password'
                value={password}
                placeholder='Enter password'
                onChange ={handlePasswordChange}
                className='input'
                required
                />
                <br/><br/><br/>

                <label className='label'>Confirm Password</label>
                <br/>
                <input
                name='password_confirmation'
                type='password'
                placeholder='Re-enter password'
                value={password_confirmation}
                onChange={handlePassword_confirmationChange}
                className='input'
                required
                />
                <br/><br/><br/>

                <button 
                    type='submit'
                    className='login_button'> SUBMIT</button>
                <br/><br/>

                <h4 >{message}</h4>
               

            </form>
            </div>

            
            </div>
            
            :<h1>ADMIN PLEASE LOGIN </h1>
            
            }
        </div>
        
    )
}

export default CreateUser