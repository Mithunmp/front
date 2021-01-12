import React, {Component} from 'react'

class Visitor extends Component{

    constructor(){
        super()
        this.state= {
            message: 'Hello visitor'
        }
    }
    changeState= () => {
        this.setState({
            message: 'Subscribed'
        })
    }

    
    render(){
        return (
            <div>
            <h1>{this.state.message} </h1> 
            <button onClick={this.changeState} >Subscribe</button>
            </div>
        )
    }
}
 
export default Visitor