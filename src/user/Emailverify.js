import axios from 'axios';
import React, { Component, useEffect, useState } from 'react';
import {Link, Redirect, useParams} from 'react-router-dom'

const Emailverify = (props) => {
   
    const [token,setToken] = useState('')
    const [message,setMessage] = useState('')
        
    useEffect(()=>{
        const params = new URLSearchParams(props.location.search)
        const token = params.get('token')
        setToken(token)
        console.log(token);
    },[])

    const handleSubmit = (event) => {
        
        axios
            .post("http://localhost:8000/api/emailver", 
            {token : token},
            {withCredentials : true}
            )
            .then(response => {    
                console.log('response',response)   
                setMessage(response.data.message) 
            })
            .catch(error => {
                console.log('error', error)
            })

        event.preventDefault()
    }
    

    
        return(
            <div>
                {/* <h1>{this.state.token}</h1> */}
                {localStorage.getItem('login_token')?
                    <Redirect to='allusers'/>
                    :
                    <span></span>
                }
                
                <form onSubmit={handleSubmit}>
               
                <button type='submit' >Verify email</button>

                {message==='email_verified'?
                    <Redirect  to='/login'/>
                    :
                    <span></span>}

                
                
                
                
                </form>
                
            </div>
        )
    
}
export default Emailverify
