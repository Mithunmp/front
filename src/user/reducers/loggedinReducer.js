//import {LOGGEDIN} from './user/actions/loggedinTypes'
const initialState = {
    logged_in : false
}

const loggedinReducer = (state = initialState, action) =>{
    switch(action.type){
        case 'LOGGEDIN' : return {
            logged_in : true
        }
        case 'LOGGEDOUT' : return {
            logged_in : false,
            is_admin : false
        }

        default :
        return state
    }

}

export default loggedinReducer