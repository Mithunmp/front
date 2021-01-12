    import {React, useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import {Link, Redirect} from 'react-router-dom'
import LeftNav from './LeftNav';
import Piechart from './PieChart';
import TodaysTask from './TodaysTask'


const Userhome = (props) => {
    //const [cur_user , setCur_user] = useState([]);
    
    
   
    
    

    // const [id,setId] = useState('')
    // const [name,setName] = useState('')
    // const [email,setEmail] = useState('')

    // setId(data.id)
    // setName(data.name)
    // setEmail(data.email)
    

    //setCur_user(data)
    // useEffect(()=>{
    //     if(localStorage.getItem('login_token') == null ){
    //     props.history.push('/login')
       
    //    }
    // },[])
    

    

    return (<div className='userhome'>
        {localStorage.getItem('login_token') == null?
        //props.history.push('/login') :
        <Redirect  to='/'/> :
        <span >
            <div className='nav'>
                <h2>USER MANAGEMENT</h2>
         <Link className='navlogout' to='/logout'>
                    <span >logout </span>
                </Link>  
                </div>
                <LeftNav/>
        <div className='todaystask'>
        < TodaysTask />
        </div>
        
        <div className='piechart'>
        <Piechart/>
        </div>
    
    </span>
}

</div>

    )

}

export default Userhome