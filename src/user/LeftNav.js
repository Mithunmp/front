import React from 'react';
import { Link } from 'react-router-dom';

const LeftNav =() => {

    return (
        <div className='leftnav'>

            
            <h4 >&nbsp;&nbsp;NAME &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {localStorage.getItem('name')}</h4>
            <h4 >&nbsp;&nbsp;EMAIL ID : {localStorage.getItem('email')}</h4>
            <br/><br/>
            <Link to='/userhome'> 
                <span className='leftnav_a'>HOME</span> </Link>
            <br/><br/>

            <Link to='/allusers'
                className='leftnav_a'> 
                USERS</Link>
            <br/><br/>
            <Link to='/alltasks'
                className='leftnav_a'>
                    TASKS </Link>

        </div>
    )
}
export default LeftNav