
const initialstate = {
    user : []
}

const getCurrentUserReducer = (state = initialstate, action) => {
    switch(action.type){
        case 'GETCURRENTUSER' : return{
            user : action.payload}
        default : return state
    }
}

export default getCurrentUserReducer