import axios from 'axios'
import React, { useEffect } from 'react'
import { useState} from 'react'
import {useSelector, useDispatch } from 'react-redux'
import {Link, Redirect} from 'react-router-dom'
import Pagination from 'react-js-pagination'
import LeftNav from './LeftNav'


const AllUsers = (props) => {

    

    const [data , setData] = useState([])
    const [keyword, setKeyword] = useState('')
    const [assignee_id, setAssignee_id] = useState('')
    const [addtask, setAddtask] = useState(false)

    const [pagenumber,setPagenumber] = useState(1)
    const [activePage,setActivePage] = useState(1)
    const [totalItemsCount, setTotalItemsCount] = useState(1)

    const userdata = useSelector(state => state.getCurrentUserReducer.user)
    const logged_in = useSelector(state => state.loggedinreducer.logged_in)
    const isAdmin = useSelector(state => state.isAdminReducer.is_admin)
    
    if (isAdmin){
        localStorage.setItem('isAdmin', true)
    }

    
    if (logged_in){
        localStorage.setItem('isLogged',logged_in)
        localStorage.setItem('id',userdata.id)
        localStorage.setItem('name',userdata.name)
        localStorage.setItem('email',userdata.email)
        }

    
    if (localStorage.getItem('login_token')===null){
        props.history.push('/');
    }

    useEffect(()=>{


        axios.post("http://localhost:8000/api/search?page="+pagenumber,{
            keyword : keyword,
            token : localStorage.getItem('login_token')
        }
        )

        .then(response => {
            console.log(response);
            const data = response.data.data
            setData(data)
            console.log(data)
            setActivePage(response.data.current_page)
            setTotalItemsCount(response.data.total)
            
        })

        .catch(error => {
            console.log(error.response)
        })
       
    },[keyword])

    const handlePagination = (pagenumber) => {
        axios.post("http://localhost:8000/api/search?page="+pagenumber,{
            keyword : keyword,
            token : localStorage.getItem('login_token')
        }
        )

        .then(response => {
            console.log(response);
            const data = response.data.data
            setData(data)
            console.log(data)
            setActivePage(response.data.current_page)
            setTotalItemsCount(response.data.total)
            
        })

        .catch(error => {
            console.log(error.response)
        })
    }

    const handleKeywordChange = (event) => {
        const keyword = event.target.value
        setKeyword(keyword)
        
    }

    const handleDelete = (event) =>{
        const del_email = event.target.value
        const confirm = window.confirm('Do you confirm delete? User will be permenently deleted')
        if(confirm){
            if (del_email == 'admin@xy.com'){
                return console.log('cant delete admin')
            }
            axios.post("http://localhost:8000/api/userdelete",{
                token: localStorage.getItem('login_token'),
                email : event.target.value
            }, {withCredentials:true})

            .then(response =>
                console.log(response.data))
            .catch(error=>{
                console.log(error.response.data.message)
                alert(error.response.data.message)
            })

            //props.history.push('/userhome')
            axios.post("http://localhost:8000/api/search?page="+pagenumber,{
                keyword : '',
                token : localStorage.getItem('login_token')
            },{withCredentials : true}
            )

            .then(response => {
                const data = response.data.data
                console.log(data)
                setData(data)
                setActivePage(response.data.current_page)
                setTotalItemsCount(response.data.total)
            
            })

            .catch(error => {
                console.log(error.response.message)
            })
            }
        
        }

    const handleAddTask= (event) => {
        const confirm = window.confirm('Do you confirm your add task action? ')
        if(confirm){
        setAddtask(true);
        setAssignee_id(event.target.value);
        console.log(assignee_id);
        }

    }

    
  
    
    return (
        <div>
            
            {localStorage.getItem('login_token') == null?
                    //props.history.push('/login') :
                    <Redirect  to='/'/> :
                    <span></span>
                }

            <div className='nav'>
                <h2>USER MANAGEMENT</h2>
                {localStorage.getItem('isAdmin')?<div>
                <Link to='/createuser' className='navadduser'> 
                Add account</Link>
            </div>:<span></span>}
            <Link className='navlogout' to='/logout'>
                    <span >logout </span>
                </Link>  
                </div>
            <div>
            <LeftNav/>
            
            
            <form className='Search' >
                <input 
                    type='text' 
                    name='keyword' 
                    value = {keyword} 
                    placeholder=' Search by name/email' 
                    onChange={handleKeywordChange}>
                </input>
            </form>
            <div>
            
            
            
                <table className= 'tableuser'>
                    <tr>   
                        
                        <th className='th_user'>NAME</th>
                        <th className='th_user'>EMAIL</th>
        
                    </tr>
                    {data.map((list) => <tr key = {list.email}>
                    
                    <td className='list'>{list.name}</td>
                    <td className='list'>{list.email}</td>
                    {localStorage.getItem('id') == 9 ? 
                        <button  value={list.id} className = 'addtask' onClick ={handleAddTask}>
                        Add Task</button>
                        :
                        (list.id !=9 ? <button  value={list.id} className = 'addtask' onClick ={handleAddTask}>
                        Add Task</button>:<span></span>)
                        
                    }
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    
                    { 
                        localStorage.getItem('isAdmin') ?
                            
                            (list.id != 9 ?
                        
                             <button  
                                className = 'delete' 
                                value={list.email} 
                                onClick = {handleDelete}>
                                 DELETE
                            </button>
                            : 
                            <button disabled className='delete_disabled'> DELETE</button>
                            
                            )
                            : 
                            <span></span>
                    }
                    
                    
                    {/* <button className = 'delete' >Add Task</button> */}
                    

                    </tr>         
            )}
            
            </table>
            <Pagination activePage = {activePage}
                        totalItemsCount = {totalItemsCount}
                        itemsCountPerPage = {10}
                        innerClass = 'pagination'
                        activeClass = 'active'
                        firstPageText = ' FIRST '
                        lastPageText = 'LAST '
                        nextPageText = '>'
                        prevPageText = '<'
                        onChange={(pagenumber)=>{handlePagination(pagenumber)}}
                        /> 
            </div>
            
              
            
            {addtask?<Redirect to = {{
                            pathname : '/addtask',
                            state : {
                                id : assignee_id
                            }
            }}/>:<h4></h4>}

            </div>
                
        </div>
    )

}
export default AllUsers


// const handleSubmit = () => {
        
    //     axios.post("http://localhost:8000/api/search",{
    //         keyword: keyword,
    //         token : localStorage.getItem('login_token')
    //     },{withCredentials : true})
    //     .then(response => {
    //         const data = response.datasetSata(data)
    //         console.log(response)
    //     })
    //     .catch(error =>{
    //         console.log(error)
    //     })
    //     console.log('test')
    // }
    //const listItems = data.map((d) => <li key={d.email}>{d.name} {d.name}</li>);