import React,{useState} from 'react'
import axios from 'axios'
import {Link, Redirect} from 'react-router-dom'


const Signup = () => {
    
    const [name, setName]= useState('')
    const [email, setEmail]= useState('')
    const [password, setPassword]= useState('')
    const [password_confirmation, setPassword_confirmation]= useState('')
    const [error_message , seterror_message]=useState([])
    const [caughterror,setCaughterror] = useState(false)
    const onChangeName = (event) => {
        const name = event.target.value
        setName(name)
    }
    const onChangeEmail = (event) => {
        const email = event.target.value
        setEmail(email)
    }
    
    const onChangePassword = (event) => {
        const password = event.target.value
        setPassword(password)
    }

    const onChangePassword_confirmation = (event) => {
        const password_confirmation = event.target.value
        setPassword_confirmation(password_confirmation)
    }

    const formSubmit = (event) =>{

        axios
            .post("http://localhost:8000/api/signup",
            {
                name : name ,
                email :email,
                password : password,
                password_confirmation : password_confirmation
            }, { withCredentials : true })
            .then(response => {
                console.log( 'response', response)
                localStorage.setItem('verify_token',response.data.verify_token )
                seterror_message(response.data.error)
                
            })
            .catch(error => {
                console.log(error.response)
                if(error.reponse.data.password !=null){
                    seterror_message(error.response.data.password)
                    setCaughterror(true)
                    if(error.response.data.password == 'The password format is invalid.')
                    {
                        seterror_message(['Password must contain atleast one letter, number and special character'])
                    }
                }
                
                
                
                
                
            })
        event.preventDefault()
    }
    
        //console.log("accept change", event)

    

    
return ( 
            <div className='loginpage'>
                {localStorage.getItem('login_token')?
                    <Redirect to='allusers'/>
                    :
                    <span></span>
                }
                <div className='login'>

                <form onSubmit={formSubmit}>
                    <div className='login-head'>REGISTER</div>
                    <label className='label'> Name </label>
                    <br/>
                    <input 
                    className='input'
                    type='text' 
                    name='name' 
                    value={name} 
                    placeholder='Enter name ' 
                    onChange={onChangeName}
                    maxlength="256"
                    required
                    />
                    <br/><br/>

                    <label className='label' >Email </label>
                    <br/>
                    <input 
                    className='input'
                    type='email' 
                    name='email' 
                    value={email} 
                    placeholder='Enter email ' 
                    onChange={onChangeEmail}
                    maxlength="256"
                    required/>
                    <br/>
                    <br/>

                    <label className='label' > Password </label>
                    <br/>
                    <input
                    className='input' 
                    type='password' 
                    name='password' 
                    value={password} 
                    placeholder='Enter Password ' 
                    onChange={onChangePassword}
                    maxlength="256"
                    required/>
                    <br/>
                    <br/>

                    <label className='label' >Confirm Password</label>
                    <br/>
                     <input 
                     className='input'
                    type='password' 
                    name='password_confirmation' 
                    value={password_confirmation} 
                    placeholder='Re-enter Password ' 
                    onChange={onChangePassword_confirmation}
                    maxlength="256"
                    required/>
                    <br/>
                    <br/>

                    <button  className='login_button' type="submit"> Signup </button>
                
                <ul>
                {caughterror?
                    error_message.map((error) =>
                        <li className='error' key={error}>{error}</li>):
                        <h4 className = 'error'>{error_message}</h4>
                    
                }
                </ul>

                <Link className='link' to='/login'>
                    Already have an account?
                    </Link>
                    <br/><br/>

                </form>
            
                {localStorage.getItem('login_token')?
            <Redirect to='/userhome' />
                :
                <span></span>}
                </div>
            </div>
         );
    }

 
export default Signup