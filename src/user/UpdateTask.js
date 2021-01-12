import axios from 'axios';
import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import LeftNav from './LeftNav';

const UpdateTask = (props) => {
    const id = props.location.state.task_id
    const [title, setTitle] = useState(props.location.state.task_title)
    const [description, setDescription] = useState(props.location.state.task_description)
    const [due_date, setDue_date] = useState(props.location.state.task_due_date)

    const [message,setMessage] = useState('')
    

    const handleTitleUpdate =(event) => {
        setTitle(event.target.value)
    }

    const handleDescriptionUpdate = ( event ) => {
        setDescription(event.target.value)
    }

    const handleDue_dateUpdate = (event) => {
        setDue_date(event.target.value)
    }

    const handleUpdateSubmit = (event) => {
        const confirm = window.confirm('Are you sure you want to update?')
        if (confirm){
            axios
                .post('http://localhost:8000/api/updatetask',{
                    id : id,
                    title : title,
                    description : description,
                    due_date : due_date,
                    token : localStorage.getItem('login_token')
                })
                .then(response => {
                    setMessage(response.data.message)
                })
                .catch(error => {
                    console.log(error.response)
                })
        }
        event.preventDefault()
    }


    return (
        <div >
            <div className='nav'>
                <h2> TASK MANAGEMENT</h2>
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
            className='login'
            onSubmit={handleUpdateSubmit}>

                <h3 className='login-head'>UPDATE TASK</h3>
            <label className='label'> TITLE </label>
            <br/>
            <input 
                type='text'
                name='title'
                value={title}
                className='input'
                onChange={handleTitleUpdate}
                maxLength='256'
                required
                />
            <br/><br/>

            <label className='label' > DESCRIPTION</label>
            <br/>
            <textarea
                    type='text'
                    name='description'
                    value={description}
                    className='input'
                    onChange={handleDescriptionUpdate}
                    maxLength='256'
                    required
                    />
            <br/><br/>
            <label className='label' > DUE DATE </label>
            <br/>
            <input 
                type='date'
                name='due_date'
                value={due_date}
                className='input'
                onChange={handleDue_dateUpdate}
                required
                />
            <br/><br/>

            <button 
                type='submit'>
                    UPDATE
                </button>

    <h4 className='error'>{message}</h4>

                
                <br/><br/>

            {
                message === 'task updated' ? 
                            <Redirect to='alltasks' /> :
                            <span></span>
            }



        </form>
        </div>
        
    )

}
export default UpdateTask