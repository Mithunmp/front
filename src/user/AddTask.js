import axios from 'axios';
import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import LeftNav from './LeftNav';


const AddTask = (props) => {
    const [assignee, setAssignee] = useState(props.location.state.id)
    const [title,setTitle] = useState('')
    const [description,setDescription] = useState('')
    const [due_date,setDue_date] = useState('')
    const [message,setMessage] = useState('')

    const handleTitleChange = (event) => {
        setTitle(event.target.value)
    }

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value)
    }
    const handleDue_dateChange = (event) => {
        setDue_date(event.target.value)
        console.log(due_date)
    }

    const handleSubmit = (event) =>{
        axios.post('http://localhost:8000/api/createtask',{
            token : localStorage.getItem('login_token'),
            user_id : assignee,
            title : title,
            description : description,
            due_date : due_date

        })
        .then(response => {
            console.log(response.data.message)
            setMessage(response.data.message)
        })
        .catch(error => {
            console.log(error.response.data.message)
            setMessage(error.response.data.message)
        })

        event.preventDefault()
    }


    return(
        <div>
             <div className='nav'>
                <h2>TASK MANAGEMENT</h2>
                {localStorage.getItem('isAdmin')?<div>
                <Link to='/createuser' className='navadduser'> 
                Add account</Link>
            </div>:<span></span>}
            <Link className='navlogout' to='/logout'>
                    <span >logout </span>
                </Link>  
                </div>
            
            <LeftNav/>
            
            <form  
                onSubmit={handleSubmit}
                className='login'>
                <h3 className='login-head'>ADD  TASK</h3> <br/><br/>
    
                <label className='label'> Task Title</label>
                <br/>
                <input 
                    type='text'
                    name='title'
                    value={title}
                    onChange={handleTitleChange}
                    className='input'
                    required
                    maxLength='256'/>
                <br/><br/>
                <label className='label' > Description </label>
                <br/>
                <textarea
                    className='input'
                    type='text'
                    name='description'
                    value={description}
                    onChange={handleDescriptionChange}
                    className='input'
                    required
                    maxLength='256'
                    />
                    
                <br/><br/>
                <label className='label' > Due Date </label>
                <br/>
                <input 
                    className='input'
                    type='date'
                    name='due_date'
                    value={due_date}
                    onChange={handleDue_dateChange}
                    required/>
                <br/><br/>
                <button 
                    type='submit'
                    className='login_button'> 
                    Add Task 
                </button>
                <br/><br/>
                {message=='task added'?
                <Redirect to='alltasks'/>
                :
                <h4>{message}</h4>
                }
    


            </form>
        
        </div>
    )



}

export default AddTask