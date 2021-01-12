import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts/highstock'
import PieChart from 'highcharts-react-official'
import axios from 'axios';
import { Redirect } from 'react-router-dom';


const  Piechart = (props) => {
    
    const [inprogress,setInprogress] = useState(0)
    const [ontime,setOnime] = useState(0)
    const [overdue,setOverdue] = useState(0)
    const [inactive,setInactive] = useState(1)
    const [afterdeadline,setAfterDeadline] = useState(0)

    useEffect(()=>{
        axios
            .post('http://localhost:8000/api/piechart',{
                token : localStorage.getItem('login_token')
            })
            .then(response=> {
                console.log(response.data)
                setInprogress(response.data.inprogress)
                setOnime(response.data.ontime)
                setOverdue(response.data.overdue)
                setInactive(response.data.inactive)
                setAfterDeadline(response.data.afterdeadline)
            })
    },[])

    // 'inprogress' => $inprogress,
    //                             'ontime' => $ontime,
    //                             'overdue' => $overdue,
    //                             'inactive' => $inactive,
    //                             'afterdeadline'=> $afterdeadline

    const options = {
        chart : {
            type: "pie",
        },
        title : {
            text : 'TASK STATUS'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        series : [
            {
                data : [
                    
                    {
                        y:inprogress , name: 'INPROGRESS'
                    },
                    {
                        y:ontime, name: 'COMPLETED ONTIME'
                    } ,
                    {
                        y:overdue, name: 'OVERDUE'
                    }  ,
                    {
                        y:inactive, name: 'INACTIVE'
                    }  ,
                    {
                        y:afterdeadline, name: 'COMPLETED AFTER DEADLINE'
                    }  
                ]
            }
        ]
    };
    
    return(
        
        <PieChart highcharts={Highcharts} options={options} />
       
    )
    
}
export default Piechart