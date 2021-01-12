import React from 'react'

const Hello = (props) => {
    return(<div>
    <h2> Hello {props.name} </h2>
    {props.children}
    </div>)
}



export default Hello