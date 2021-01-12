import React, { Component } from 'react'

class Clickbind extends Component{

    constructor(props){super(props)
        this.state = { message : 'Hello'}
        this.changemessage=this.changemessage.bind(this)   
    }

    changemessage = () => {
        this.setState({
            message : 'Welcome'
        })
    }
        
    
    

    render(){
        return(
            <div>
                <p>{this.state.message} </p>
                <button onClick={this.changemessage}> Click Here </button>
            </div>
        )
    }

}
export default Clickbind
