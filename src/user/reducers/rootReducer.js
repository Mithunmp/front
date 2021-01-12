import {combineReducers} from 'redux'
import loggedinreducer from './loggedinReducer'
import getCurrentUserReducer from './getCurrentUserReducer'
import {isAdminReducer} from './isAdminReducer'
//import  logoutReducer  from './logoutReducer'

const rootReducer = combineReducers({
    loggedinreducer : loggedinreducer,
    getCurrentUserReducer : getCurrentUserReducer,
    isAdminReducer : isAdminReducer,
    //logoutReducer : logoutReducer

})

export default rootReducer