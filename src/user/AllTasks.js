import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import Pagination from 'react-js-pagination'
import LeftNav from './LeftNav';

const AllTask = (props) => {

    const [data, setData] = useState([])
    const [user_list, setUser_list]= useState([])
    const [search, setSearch] = useState('')
    const [keyword, setKeyword] = useState('')
    const [updateNow, setUpdateNow] = useState(false)

    //const [status,setStatus] = useState('')

    const [totalItemsCount, setTotalItemsCount] = useState(1)
    const [pagenumber, setPagenumber] = useState(1)
    const [activePage,setActivePage] = useState(1)
    const [itemsCountPerPage,setitemsCountPerPage] = useState(10)

   
    if(data == null){
        setKeyword('')
    }
    const handlePagination = (pagenumber) => {
        axios
            .post('http://localhost:8000/api/searchtask?page='+pagenumber,{
                token : localStorage.getItem('login_token'),
                search : search,
                keyword : keyword
            })
            .then(response=>{
                console.log(response)
                const data = response.data.task.data
                const user_list = response.data.user_list;
                setData(data)
                setUser_list(user_list)
                setTotalItemsCount(response.data.task.total)
                setActivePage(response.data.task.current_page)
                console.log(activePage)
                console.log(pagenumber)
                
                //console.log(user_list)
            })
            .catch(error=>{
                console.log(error.response)
            })
        
    }

    useEffect(()=> {
        handlePagination()
        // axios
        //     .post('http://localhost:8000/api/searchtask?page='+pagenumber,{
        //         token : localStorage.getItem('login_token'),
        //         search : search,
        //         keyword : keyword
        //     })
        //     .then(response=>{
        //         //console.log(response)
        //         const data = response.data.task.data
        //         const user_list = response.data.user_list;
        //         setData(data)
        //         setUser_list(user_list)
        //         setTotalItemsCount(response.data.task.total)
                
        //         //setActivePage(response.data.task.current_page)
                
        //         //console.log(user_list)
        //     })
        //     .catch(error=>{
        //         console.log(error)
        //     })

    },[keyword])


    const handleSearch = (event) => {
        const search = event.target.value
        setSearch(search)
        setKeyword('')
        
    }

    const handleKeyword = (event) => {
        const keyword = event.target.value
        setKeyword(keyword)
        localStorage.setItem('keyword',keyword)
    }


    

    const handleStatusUpdate = (id,event) => {
        const status = event.target.value   
        if (status !=''){
            axios
                .post('http://localhost:8000/api/updatestatus',{
                    id : id,
                    status : status,
                    token : localStorage.getItem('login_token')
                })
                .then(response=>{
                    console.log(response)
                    
                })
                .catch(error=>{
                    console.log(error)
                })

                axios
                .post('http://localhost:8000/api/searchtask?page='+pagenumber,{
                    token : localStorage.getItem('login_token'),
                    search : search,
                    keyword : keyword
                })
                .then(response=>{
                    //console.log(response)
                    const data = response.data.task.data
                    const user_list = response.data.user_list;
                    setData(data)
                    setUser_list(user_list)
                    setTotalItemsCount(response.data.task.total)
                    
                    //setActivePage(response.data.task.current_page)
                    
                    //console.log(user_list)
                })
                .catch(error=>{
                    console.log(error)
                })
        }



    }

    const handleDelete = (event) => {
        const id = event.target.value  
        const confirm = window.confirm('Do you confirm to delete? The task will be permenently deleted')
        if (confirm) {

            axios   
                .post('http://localhost:8000/api/deletetask',{
                    token : localStorage.getItem('login_token'),
                    id : id
                })
                .then(response=> {
                    console.log(response.data)
                })
                .catch(error => {
                    console.log(error.response)
                })    
                
                axios
                .post('http://localhost:8000/api/searchtask?page='+pagenumber,{
                    token : localStorage.getItem('login_token'),
                    search : '',
                   
                })
                .then(response=>{
                    const data = response.data.task.data
                    const user_list = response.data.user_list;
                    setData(data)
                    setUser_list(user_list)
                    //console.log(data)
                    //console.log(user_list)
                })
                .catch(error=>{
                    console.log(error.response)
                })
        }  
    } 
    
    const handleUpdate = (event) => {
        setUpdateNow(true)
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
            <div>
            <LeftNav/>
            <br/>
            <span className='searchtask'>
            <label>Search by </label> 
            
            <select   onChange={handleSearch}>
                <option value=''>ALL TASKS</option>
                <option value="title">TITLE</option>
                <option value="assigner">ASSIGNER</option>
                <option value="assignee">ASSIGNEE</option>
                <option value="due_date">DUE_DATE</option>
                <option value="status">STATUS</option>
            </select>
            {(search=='assigner' || search=='assignee')?<div>
                                
                                <select onChange={handleKeyword} className='searchtask'>
                                    <option value='' disabled >select</option>
                                {user_list.map((list)=>
                                    <option key={list.id} value={list.id}> {list.email}</option>
                                )}
                                </select>
                        </div>:<h1></h1>}
            {search == 'status'&&
                            <div>
                                <select onChange={handleKeyword} className='searchtask'>
                                    {search=='status'?<React.Fragment><option value='assigned'> ASSIGNED</option>
                                    <option value='inprogress'> INPROGRESS</option>
                                    <option value='completed'> COMPLETED</option></React.Fragment>:
                                    <option value='completed'> COMPLETED</option>}
                                </select>
                            </div>
                            
                            
            
            }
            {search == 'due_date'?
                            <div>
                                <input  type='date' 
                                        value={keyword} 
                                        className='searchtask'
                                        onChange={handleKeyword}/>
                            </div>
                            :
                            <h1></h1>
            
            }
            {search == 'title'?
                            <div>
                                <input  type='text'  
                                        placeholder='task content' 
                                        value={keyword} 
                                        className='searchtask'
                                        onChange={handleKeyword}/>
                            </div>
                            :
                            <h1></h1>
            
            }    
            </span>
                {/* <button  onClick={handleSubmit}>Search</button> */}
            
            
            
            <table className='tabletask'>
                <tr className='taskhead'>
                <th clasName='taskcolumn'>TITLE</th>
                <th clasName='taskcolumn'>DESCRIPTION</th>
                <th clasName='task_duedate'>DUE DATE</th>
                <th >ASSIGNEE</th>
                <th clasName='taskcolumn'>ASSIGNER</th>
                <th clasName='taskcolumn'>STATUS</th>
                </tr >

                {data.map((list)=>
                        <tr className='taskrow' key={list.id}>
                            <td className='list'>{list.title}</td>
                            <td className='list'>{list.description}</td>
                            <td className='list'>{list.due_date}</td>
                            {user_list.filter(user => user.id == list.user_id).map(filtereduser =>(
                            <td  className='list'> {filtereduser.email}
                            </td>))}
                            {user_list.filter(user => user.id == list.assigner).map(filtereduser =>(
                            <td  className='list'> {filtereduser.email}
                            </td>))}
                            <td className='list'>{list.status} </td>

                             {/* update Status option */}

                            <span className='td_updatestatus'>
                            {localStorage.getItem('id') == list.user_id ?
                                <select 
                                    className='updatestatus'  
                                    onChange={(event)=>{handleStatusUpdate(list.id,event)}}>
                                <option value=''>Changestatus</option>
                                <option value='inprogress'>inprogress</option>
                                <option value='completed'>completed</option>
                                
                            </select>
                            :
                            <span></span>
                            }
                            </span>

                            {/* Delete Task Option 
                                Admin id is 9 */}
                            <td className='td_updatestatus'>

                            {localStorage.getItem('id')== list.assigner || localStorage.getItem('id')== 9 ?     
                                
                                    <button  
                                    className = 'delete' 
                                    value={list.id} 
                                    onClick = {handleDelete}>
                                    DELETE
                                    </button>
                                :
                                <span></span>        
                            }
                            </td>

                            {/* Update Task */}

                            <td>
                            { localStorage.getItem('id') == list.assigner ?
                                <button 
                                    onClick={handleUpdate}>
                                    UPDATE
                                </button>
                                :
                                <span></span>
                            }

                            {updateNow?
                                <Redirect to={{
                                    pathname : '/updatetask',
                                    state : {
                                        task_id : list.id,
                                        task_title : list.title,
                                        task_description : list.description,
                                        task_due_date : list.due_date
                                    }
                                }
                                    
                                }
                                /> 
                                
                                :
                                <span></span>}
                                </td>
                                
                                
                                
                            
                            
                            

                        </tr>
                        )}
                
            </table>
            <div>
            <Pagination
                    totalItemsCount={totalItemsCount}
                    activePage = {activePage}
                    itemsCountPerPage = {10}
                    innerClass = 'pagination'
                    activeClass = 'active'
                    firstPageText = 'FIRST '
                    lastPageText = 'LAST '
                    nextPageText = '>'
                    prevPageText = '<'
                    onChange={(pagenumber)=>{handlePagination(pagenumber)}}
                    />
                       
                    </div>

        </div>
        </div>
    )
}

export default AllTask