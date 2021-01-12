import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Pagination from 'react-js-pagination'
import { Link } from 'react-router-dom';

const TodaysTask = () =>{

    const [data,setData] = useState([])
    
    const [pagenumber] = useState(1)
    const [activePage,setActivePage] = useState(1)
    const [totalItemsCount, setTotalItemsCount] = useState(1)


    useEffect(()=>{
        axios
            .post('http://localhost:8000/api/todaystask?page='+pagenumber,{
                token : localStorage.getItem('login_token')
            })
            .then(response=>{
                console.log(response.data.tasks)
                setData(response.data.tasks.data)
                setActivePage(response.data.tasks.current_page)
                setTotalItemsCount(response.data.tasks.total)
            })
            .catch(error=>{
                console.log(error)
            })
    },[])

    const handlePagination = (pagenumber) => {
        axios
            .post('http://localhost:8000/api/todaystask?page='+pagenumber,{
                token : localStorage.getItem('login_token'),
            })
            .then(response=>{
                const data = response.data.tasks.data
                setData(data)
                setTotalItemsCount(response.data.tasks.total)
                setActivePage(response.data.tasks.current_page) 
            })
            .catch(error=>{
                console.log(error.response)
            })
        
    }

    return(
        <div>
            <table className='tttable'>
                <tr clasName='tthead'>
                <th className='tthead_th'> TODAY'S TASK </th>
                </tr>
               
        {data.map((list)=>
        <tr key={list.id}
            className='ttrow'>
        <td className='ttdata'>
        <ul >
            <Link className='tt_title' to='/alltasks'>
        <li className='tt_title'>{list.title}</li>
        </Link>
        
            <ul>
                <li>{list.description}</li>
                <li>Due date is {list.due_date} and assigned on {list.created_on}</li>
                <li>Status : {list.status}</li>  
                
            </ul>
            </ul>
       
        </td>
            </tr>
            )}
            
             </table>

             <Pagination
                    totalItemsCount={totalItemsCount}
                    activePage = {activePage}
                    itemsCountPerPage = {2}
                    innerClass = 'pagination'
                    activeClass = 'active'
                    firstPageText = 'FIRST '
                    lastPageText = 'LAST '
                    nextPageText = '>'
                    prevPageText = '<'
                    onChange={(pagenumber)=>{handlePagination(pagenumber)}}
                    />
            
            
            </div>
            
    )

}
export default TodaysTask;